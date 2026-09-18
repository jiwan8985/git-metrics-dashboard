import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
    files: 'out-integration/test/**/*.test.js',
    ...(process.env.VSCODE_EXECUTABLE_PATH
        ? { useInstallation: { fromPath: process.env.VSCODE_EXECUTABLE_PATH } }
        : { version: process.env.VSCODE_TEST_VERSION || 'stable' }),
    ...(process.env.GIT_METRICS_TEST_WORKSPACE
        ? { workspaceFolder: process.env.GIT_METRICS_TEST_WORKSPACE }
        : {}),
    launchArgs: [
        '--disable-extensions', '--skip-welcome', '--skip-release-notes', '--disable-workspace-trust',
        ...(process.env.GIT_METRICS_CAPTURE_PORT
            ? [`--remote-debugging-port=${process.env.GIT_METRICS_CAPTURE_PORT}`, '--remote-debugging-address=127.0.0.1']
            : [])
    ],
    mocha: { timeout: 60000 },
});
