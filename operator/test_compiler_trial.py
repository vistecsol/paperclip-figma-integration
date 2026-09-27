import importlib.util
import json
from pathlib import Path
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import patch


def module(name, filename):
    spec = importlib.util.spec_from_file_location(name, Path(__file__).with_name(filename))
    result = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(result)
    return result


preflight = module('preflight', 'preflight.py')
trial = module('trial', 'compiler-trial.py')


class TrialTests(unittest.TestCase):
    def test_explicit_capacity_boundary_and_invalid_budgets(self):
        g = 1024**3
        self.assertEqual(preflight.evaluate(6*g, 12*g, False, 4, 2, 12, 2), [])
        self.assertTrue(preflight.evaluate(6*g-1, 12*g, False, 4, 2, 12, 2))
        self.assertTrue(preflight.evaluate(6*g, 12*g-1, False, 4, 2, 12, 2))
        self.assertTrue(preflight.evaluate(6*g, 12*g, True, 4, 2, 12, 2))
        with self.assertRaises(ValueError): preflight.evaluate(6*g, 12*g, False, 4, 2, 2, 2)

    def test_rejected_capacity_never_contacts_docker_and_latches_evidence(self):
        with tempfile.TemporaryDirectory() as directory:
            a = SimpleNamespace(evidence=Path(directory)/'attempt', image='unused',
                name='vts-figma-test-unit', daemon_storage=Path(directory), run_id='unit')
            with patch.object(trial.subprocess, 'run', return_value=SimpleNamespace(returncode=1, stdout='{}')), patch.object(trial, 'docker') as docker:
                self.assertEqual(trial.run(a), 1)
                docker.assert_not_called()
                result = json.loads((a.evidence/'result.json').read_text())
                self.assertFalse(result['attemptedCompiler'])
                self.assertEqual(result['result'], 'refused')
                with self.assertRaises(FileExistsError): trial.run(a)

    def test_image_provenance_and_implicit_volume_rejected(self):
        image = 'sha256:'+'a'*64
        info = {'Id': image, 'Config': {}}
        receipt = dict(imageId=image, hostCommit=trial.HOST, integrationCommit='b'*40,
            lockfileSha256='c'*64, frozenInstall='passed', runnerVendorPreparation='passed', sdkBuildDependencies='passed')
        trial.validate_image(info, receipt, image)
        with self.assertRaises(ValueError): trial.validate_image(info, {**receipt, 'frozenInstall': 'deferred'}, image)
        with self.assertRaises(ValueError): trial.validate_image({'Id': image, 'Config': {'Volumes': {'/data': {}}}}, receipt, image)

    def test_timeout_stops_only_owned_exact_id_and_retains_failure(self):
        with tempfile.TemporaryDirectory() as directory:
            image = 'sha256:'+'a'*64
            cid = 'd'*64
            receipt = Path(directory)/'receipt.json'
            receipt.write_text(json.dumps(dict(imageId=image, hostCommit=trial.HOST,
                integrationCommit='b'*40, lockfileSha256='c'*64, frozenInstall='passed',
                runnerVendorPreparation='passed', sdkBuildDependencies='passed')))
            a = SimpleNamespace(evidence=Path(directory)/'attempt', image=image,
                name='vts-figma-test-unit', daemon_storage=Path(directory), run_id='unit', receipt=receipt)
            inspection = {'Name': '/'+a.name, 'Config': {'Labels': {trial.LABEL: trial.ISSUE, 'vts.figma.run': 'unit'}},
                'Mounts': [], 'HostConfig': {'NetworkMode': 'none', 'Memory': 4*trial.GIB,
                'MemorySwap': 4*trial.GIB, 'CpuQuota': 100000, 'CpuPeriod': 100000, 'PidsLimit': 256},
                'State': {'ExitCode': 137, 'OOMKilled': False}}
            def docker(*args):
                if args[0] == 'info': return json.dumps({'CgroupVersion': '2', 'SecurityOptions': ['name=rootless'], 'DockerRootDir': directory})
                if args[0] == 'context': return json.dumps([{'Endpoints': {'docker': {'Host': 'unix:///test-only.sock'}}}])
                if args[0] == 'image': return json.dumps([{'Id': image, 'Config': {}}])
                if args[:2] == ('container', 'ls'): return ''
                if args[0] == 'create': return cid
                if args[:2] == ('container', 'inspect'): return json.dumps([inspection])
                if args[:2] == ('container', 'stop'): return cid
                raise AssertionError(args)
            with patch.dict(trial.os.environ, {'DOCKER_HOST': 'unix:///test-only.sock'}), patch.object(trial.subprocess, 'run', return_value=SimpleNamespace(returncode=0, stdout='{}')), patch.object(trial, 'docker', side_effect=docker) as calls, patch.object(trial.subprocess, 'Popen') as popen:
                popen.return_value.wait.side_effect = [trial.subprocess.TimeoutExpired('docker start', 900), 0]
                self.assertEqual(trial.run(a), 1)
                calls.assert_any_call('container', 'stop', '--time', '5', cid)
                self.assertFalse(any(call.args[:2] == ('container', 'rm') for call in calls.call_args_list))
                result = json.loads((a.evidence/'result.json').read_text())
                self.assertEqual(result['result'], 'failed')
                self.assertTrue(result['timedOut'])

    def test_command_retains_semantics_and_cannot_inherit_host_mounts(self):
        args = trial.create_args('sha256:'+'a'*64, 'vts-figma-test-unit', 'unit')
        self.assertNotIn('--volume', args)
        self.assertNotIn('--mount', args)
        self.assertEqual(args[args.index('--network')+1], 'none')
        self.assertIn('pnpm exec tsc --singleThreaded --noEmit -p server/tsconfig.json', args[-1])
        self.assertLess(args[-1].index('memory.max'), args[-1].index('pnpm exec'))
        self.assertFalse(trial.owned({'Name': '/paperclip-production', 'Config': {'Labels': {}}}, 'vts-figma-test-unit', 'unit'))


if __name__ == '__main__': unittest.main()
