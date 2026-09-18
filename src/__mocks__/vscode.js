module.exports = {
  window: {
    showInformationMessage: jest.fn(),
    showErrorMessage: jest.fn(),
    showWarningMessage: jest.fn(),
    createOutputChannel: jest.fn(() => ({
      appendLine: jest.fn(),
      show: jest.fn(),
      clear: jest.fn(),
    })),
    activeColorTheme: { kind: 1 },
  },
  ColorThemeKind: {
    Light: 1,
    Dark: 2,
    HighContrast: 3,
    HighContrastLight: 4,
  },
  workspace: {
    workspaceFolders: [
      {
        uri: { fsPath: '/test/workspace' },
        name: 'test',
        index: 0,
      }
    ],
    getConfiguration: jest.fn(() => ({
      get: jest.fn((key, defaultValue) => defaultValue),
      update: jest.fn(),
    })),
    onDidChangeConfiguration: jest.fn(),
    onDidChangeWorkspaceFolders: jest.fn(),
    onDidSaveTextDocument: jest.fn(),
    createFileSystemWatcher: jest.fn(),
  },
  commands: {
    registerCommand: jest.fn(),
    executeCommand: jest.fn(),
  },
  Uri: {
    file: jest.fn((path) => ({ fsPath: path })),
  },
  ViewColumn: {
    One: 1,
    Two: 2,
  },
  ExtensionContext: jest.fn(),
};
