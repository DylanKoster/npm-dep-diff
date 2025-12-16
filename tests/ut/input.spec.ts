process.env['NODE_DEV'] = 'TEST';

import {
  // @ts-expect-error
  getPackageFromFile,
  // @ts-expect-error
  getPackageFromGit,
  // @ts-expect-error
  getPackageFromNpm,
  InputSource,
  InputType,
} from '../../src/input';

describe('test getPackageFromFile function', () => {
  it('should return valid JSON on correct input', async () => {
    const json: object = await getPackageFromFile({
      type: InputType.FILE,
      source: 'tests/files/package-2.json',
    } as InputSource);

    expect(Object.keys(json)).toContain('dependencies');
    expect(json['dependencies']).toEqual({
      chalk: '^5.2.0',
      commander: '^12.1.0',
      'simple-git': '^4.22.0',
      ora: '^7.2.0',
    });
    expect(Object.keys(json)).toContain('devDependencies');
    expect(json['devDependencies']).toEqual({
      eslint: '^9.3.0',
      mocha: '^11.0.1',
    });
    expect(Object.keys(json)).toContain('bin');
    expect(Object.keys(json)).toContain('author');

    const json2: object = await getPackageFromFile({
      type: InputType.FILE,
      source: 'tests/files/package-5.json',
    } as InputSource);
    expect(Object.keys(json2)).toContain('name');
    expect(Object.keys(json2)).toContain('version');
    expect(Object.keys(json2)).toContain('scripts');
    expect(Object.keys(json2)).toContain('license');
    expect(Object.keys(json2)).toContain('dependencies');
    expect(json2['dependencies']).toEqual({});
    expect(Object.keys(json2)).toContain('devDependencies');
    expect(json2['devDependencies']).toEqual({
      typescript: '^5.4.0',
      eslint: '^9.4.0',
      vitest: '^2.0.1',
    });
    expect(Object.keys(json2)).toContain('author');

    const json3: object = await getPackageFromFile({
      type: InputType.FILE,
      source: 'tests/files/package-8.json',
    } as InputSource);

    expect(Object.keys(json3)).toContain('dependencies');
    expect(json3['dependencies']).toEqual({
      clsx: '^2.1.1',
    });
    expect(Object.keys(json3)).toContain('devDependencies');
    expect(json3['devDependencies']).toEqual({
      '@types/react': '^18.3.5',
      '@types/react-dom': '^18.3.0',
      eslint: '^9.10.0',
      rimraf: '^6.0.1',
      typescript: '^5.6.2',
      vite: '^5.4.0',
      vitest: '^2.1.1',
    });
    expect(Object.keys(json3)).toContain('peerDependencies');
    expect(json3['peerDependencies']).toEqual({
      react: '^18.2.0',
      'react-dom': '^18.3.1',
      typescript: '^5.6.2',
      'styled-components': '^6.1.0',
    });
  });

  it('should throw an error on an non-existing file.', () => {
    expect(async () => {
      await getPackageFromFile({
        type: InputType.FILE,
        source: 'tests/files/package-nonexistant.json',
      } as InputSource);
    }).rejects.toMatch('File not found: tests/files/package-nonexistant.json');
  });

  it('should throw an error when the file does not contain json', () => {
    expect(async () => {
      await getPackageFromFile({
        type: InputType.FILE,
        source: 'tests/files/text.txt',
      } as InputSource);
    }).rejects.toMatch('Error parsing JSON');
  });
});

describe('test getPackageFromGit function', () => {
  it('should return valid JSON on correct input', async () => {
    const json: object = await getPackageFromGit({
      type: InputType.GIT,
      source: 'v1.0.0',
    } as InputSource);
    expect(Object.keys(json)).toContain('dependencies');
    expect(json['dependencies']).toEqual({
      chalk: '^5.6.2',
      'cli-table3': '^0.6.5',
      'strip-ansi': '^7.1.2',
      yargs: '^18.0.0',
    });
    expect(Object.keys(json)).toContain('devDependencies');
    expect(json['devDependencies']).toEqual({
      '@types/jest': '^30.0.0',
      '@types/node': '^24.9.2',
      '@types/yargs': '^17.0.34',
      jest: '^30.2.0',
      prettier: '^3.6.2',
      'ts-jest': '^29.4.5',
      typescript: '^5.9.3',
    });
    expect(Object.keys(json)).toContain('bin');
    expect(Object.keys(json)).toContain('author');

    const json2: object = await getPackageFromGit({
      type: InputType.GIT,
      source: '239441bca572abf22d081dd2ada9c67070cfbfce',
    } as InputSource);
    expect(Object.keys(json2)).toContain('dependencies');
    expect(json2['dependencies']).toEqual({
      chalk: '^5.6.2',
      'cli-table3': '^0.6.5',
      'strip-ansi': '^7.1.2',
      yargs: '^18.0.0',
    });
    expect(Object.keys(json2)).toContain('devDependencies');
    expect(json2['devDependencies']).toEqual({
      '@types/jest': '^30.0.0',
      '@types/node': '^24.9.2',
      '@types/yargs': '^17.0.34',
      jest: '^30.2.0',
      prettier: '^3.6.2',
      'ts-jest': '^29.4.5',
      typescript: '^5.9.3',
    });
    expect(Object.keys(json2)).toContain('bin');
    expect(Object.keys(json2)).toContain('author');
  });

  it('should throw an Error if git reference does not exist', () => {
    expect(async () => {
      await getPackageFromGit({
        type: InputType.GIT,
        source: 'fe3d86dceab733720d305fd30989f7df5b9bc6e2',
      } as InputSource);
    }).rejects.toMatch('Error getting git ref.');

    expect(async () => {
      await getPackageFromGit({
        type: InputType.GIT,
        source: 'v0.0.1',
      } as InputSource);
    }).rejects.toMatch('Error getting git ref.');
  });

  it('should throw an Error if the git reference has no package.json', () => {
    expect(async () => {
      await getPackageFromGit({
        type: InputType.GIT,
        source: '3fe300152adfcd963274dc0f42cd73fd2967dc66',
      } as InputSource);
    }).rejects.toMatch('Error getting git ref.');
  });
});

describe('test getPackageFromNpm', () => {
  it('should return valid JSON on correct input', async () => {
    const json: object = await getPackageFromNpm({
      type: InputType.NPM,
      source: 'flyvictor-easysoap',
    } as InputSource);
    expect(Object.keys(json)).toContain('dependencies');
    expect(json['dependencies']).toEqual({
      moment: '^2.8.3',
      promise: '>=3.2.0',
      request: '>=2.33.0',
      underscore: '1.5.2',
      xmldoc: '0.1.2',
    });
    expect(Object.keys(json)).toContain('repository');
    expect(Object.keys(json)).toContain('contributors');
    expect(Object.keys(json)).toContain('description');

    const json2: object = await getPackageFromNpm({
      type: InputType.NPM,
      source: 'flyvictor-easysoap@latest',
    } as InputSource);
    expect(json2).toEqual(json);
  });

  it('should throw an Error if the npm package does not exist', () => {
    expect(async () => {
      await getPackageFromNpm({
        type: InputType.NPM,
        source: 'non-existent-package',
      } as InputSource);
    }).rejects.toMatch(
      'Status of call https://registry.npmjs.org/non-existent-package is not OK.',
    );

    expect(async () => {
      await getPackageFromNpm({
        type: InputType.NPM,
        source: 'non-existent-package@2.0.1',
      } as InputSource);
    }).rejects.toMatch(
      'Status of call https://registry.npmjs.org/non-existent-package is not OK.',
    );

    expect(async () => {
      await getPackageFromNpm({
        type: InputType.NPM,
        source: 'non-existent-package@latest',
      } as InputSource);
    }).rejects.toEqual(
      `Status of call https://registry.npmjs.org/non-existent-package is not OK.`,
    );
  });

  it('should throw an Error if the version does not exist', async () => {
    expect(
      getPackageFromNpm({
        type: InputType.NPM,
        source: 'base-sepolia-starter@10.0.1',
      } as InputSource),
    ).rejects.toMatch(
      'Version 10.0.1 not found for package base-sepolia-starter',
    );

    await expect(
      getPackageFromNpm({
        type: InputType.NPM,
        source: 'base-sepolia-starter@0.0.1',
      } as InputSource),
    ).rejects.toMatch(
      'Version 0.0.1 not found for package base-sepolia-starter',
    );
  });
});
