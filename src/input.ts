import fs, { Stats } from 'fs';
import simpleGit from 'simple-git';

export const enum InputType {
  NPM = 'npm',
  GIT = 'git',
  FILE = 'file',
  GITHUB = 'github',
  GITLAB = 'gitlab',
  BITBUCKET = 'bitbucket',
  GITEA = 'gitea',
  FORGEJO = 'forgejo',
  AZURE = 'azure',
}

export type InputSource = {
  readonly type: InputType;
  readonly source: string;
};

/**
 * Parse the input string to an InputSource object. Attempts to infer the type of the input, and stores it in the type
 * field. The rest of the input string (stripped of git:, npm:, or file: if they exist) in the source field.
 *
 * @param src The input string that should be parsed.
 *
 * @returns A parsed InputSource object.
 */
export function parseSource(src: string): InputSource {
  if (src.toLowerCase().startsWith('npm:')) {
    return {
      type: InputType.NPM,
      source: src.substring(4),
    } as InputSource;
  } else if (src.toLowerCase().startsWith('git:')) {
    return {
      type: InputType.GIT,
      source: src.substring(4),
    } as InputSource;
  } else if (src.toLowerCase().startsWith('file:')) {
    return {
      type: InputType.FILE,
      source: src.substring(5),
    } as InputSource;
  } else if (src.toLowerCase().startsWith('github:')) {
    return {
      type: InputType.GITHUB,
      source: src.substring(7),
    } as InputSource;
  } else if (src.toLowerCase().startsWith('gitlab:')) {
    return {
      type: InputType.GITLAB,
      source: src.substring(7),
    } as InputSource;
  } else if (src.toLowerCase().startsWith('bitbucket:')) {
    return {
      type: InputType.BITBUCKET,
      source: src.substring(10),
    } as InputSource;
  } else if (src.toLowerCase().startsWith('gitea:')) {
    return {
      type: InputType.GITEA,
      source: src.substring(6),
    } as InputSource;
  } else if (src.toLowerCase().startsWith('forgejo:')) {
    return {
      type: InputType.FORGEJO,
      source: src.substring(8),
    } as InputSource;
  } else if (src.toLowerCase().startsWith('azure:')) {
    return {
      type: InputType.AZURE,
      source: src.substring(6),
    } as InputSource;
  }

  // For now, default to file.
  // TODO: Implement type inferring.
  return {
    type: InputType.FILE,
    source: src,
  };
}

/**
 * Get the package.json contents from the InputSource object. Calls the appropriate handler funtion based on the input
 * type, or an error if the type is invalid.
 *
 * @throws Error if the source type is not any of the following: FILE, GIT, or NPM.
 *
 * @param source The InputSource object out of which the package.json should be parsed.
 *
 * @returns A JSON object with the package.json contents.
 */
export function getPackageFromInput(source: InputSource): Promise<object> {
  switch (source.type) {
    case InputType.FILE:
      return getPackageFromFile(source);
    case InputType.GIT:
      return getPackageFromGit(source);
    case InputType.NPM:
      return getPackageFromNpm(source);
    case InputType.GITHUB:
    case InputType.GITLAB:
    case InputType.BITBUCKET:
    case InputType.GITEA:
    case InputType.FORGEJO:
    case InputType.AZURE:
      return getPackageFromRemote(source);
    
    default:
      throw Error(`Unknown source type, got ${source.type}`);
  }
}

/**
 * Returns the JSON object that resembles the contents of the source file.
 *
 * @param source The file whose source should be parsed to JSON.
 * @param encoding The file encoding, default utf-8.
 *
 * @throws Error if input type is not file.
 * @throws File not found if the source file does not exist.
 * @throws SyntaxError if the file could not be parsed to JSON.
 *
 * @returns An JSON object representing the source file contents.
 */
function getPackageFromFile(
  input: InputSource,
  encoding: BufferEncoding = 'utf-8',
): Promise<object> {
  return new Promise(function (resolve, rejects) {
    if (input.type !== InputType.FILE)
      rejects(`Wrong type, expected file, got ${input.type}.`);

    if (!fs.existsSync(input.source))
      rejects(`File not found: ${input.source}`);

    const stats: Stats = fs.statSync(input.source);
    let source: string = input.source;

    if (stats.isDirectory()) source += '/package.json';

    fs.readFile(source, encoding, (err, src) => {
      if (err) rejects(`Error reading file ${source}`);
      try {
        resolve(JSON.parse(src));
      } catch (err) {
        rejects('Error parsing JSON');
      }
    });
  });
}

/**
 * Returns the JSON object that resembles the contents of the git reference.
 * This can be a branch, tag, release, or commit. Automatically finds the
 * package.json that belongs in the reference.
 *
 * @param source The git ref whose package.json should be parsed to JSON.
 * @param encoding The file encoding, default utf-8.
 *
 * @throws Error if input type is not git.
 *
 * @returns An JSON object representing the source file contents.
 */
async function getPackageFromGit(input: InputSource): Promise<object> {
  return new Promise(function (resolve, reject) {
    if (input.type !== InputType.GIT)
      reject(`Wrong type, expected GIT, got ${input.type}.`);

    return simpleGit()
      .show(`${input.source}:package.json`)
      .catch((err) => {
        reject(`Error getting git ref.`);
      })
      .then((value: string) => {
        try {
          resolve(JSON.parse(value));
        } catch (err) {
          reject('Error parsing JSON.');
        }
      });
  });
}

/**
 * Returns the JSON object that resembles the contents of the npm package.
 * Automatically finds the package.json that belongs to the package.
 *
 * @param source The git ref whose package.json should be parsed to JSON.
 * @param encoding The file encoding, default utf-8.
 *
 * @throws Error if input type is not npm.
 *
 * @returns An JSON object representing the source file contents.
 */
function getPackageFromNpm(input: InputSource): Promise<object> {
  return new Promise(function (resolve, reject) {
    if (input.type !== InputType.NPM)
      reject(`Wrong type, expected NPM, got ${input.type}.`);

    let src = input.source;

    const regex: RegExp = /.+@(?:(?:\d+.?\d*.?\d*)|(?:latest))/;
    let name: string;
    let version: string;
    if (!regex.test(src)) {
      name = src;
      version = 'latest';
    } else {
      const splits: string[] = src.split('@');
      version = splits.pop();
      // If, somehow, the name contains an @, re-add it.
      name = splits.join('@');
    }

    return fetch(`https://registry.npmjs.org/${name}`)
      .then((resp: Response) => {
        if (resp.status < 200 || resp.status >= 300) {
          reject(
            `Status of call https://registry.npmjs.org/${name} is not OK.`,
          );
        }

        return resp.json();
      })
      .then((json: object) => {
        if (!json || !json['versions']) {
          reject(
            'JSON result of call to https://registry.npmjs.org/${name} is null',
          );
        }
        if (version !== 'latest') return [json['versions'], version];

        const keys: string[] = Object.keys(json['versions']);
        return [json['versions'], keys[keys.length - 1]];
      })
      .then(([versions, version]: [object, string]) => {
        if (!versions[version]) {
          reject(`Version ${version} not found for package ${name}`);
        } else {
          resolve(versions[version]);
        }
      })
      .catch((err) => {
        reject(`Error thrown while gathering manifest for ${src}: ${err}`);
      });
  });
}

/**
 * Returns the JSON object that resembles the contents of the remote git host.
 * Automatically finds the package.json that belongs to the repository.
 * 
 * @param source The remote git host whose package.json should be parsed to JSON.
 * 
 * @throws Error if input type is not a remote git host.
 * 
 * @returns A Promise that resolves to an JSON object representing the source file contents.
 */
function getPackageFromRemote(input: InputSource): Promise<object> {
  return new Promise(function (resolve, reject) {
    let url: string;
    
    // Default ref is main.
    let ref: string = 'main';
    let name: string = input.source;
    const regex: RegExp = /.+@.+/;
    if (regex.test(input.source)) {
      const split: string[] = input.source.split("@");
      ref = split.pop();
      name = split.join("@");
    }
    
    switch (input.type) {
      case InputType.GITHUB:
        url = `https://raw.githubusercontent.com/${name}/${ref}/package.json`;
        break;
      case InputType.GITLAB:
        url = `https://gitlab.com/${name}/-/raw/${ref}/package.json`;
        break;
      case InputType.BITBUCKET:
        url = `https://bitbucket.org/${name}/raw/${ref}/package.json`;
        break;
      case InputType.GITEA:
        url = `${name}/raw/${ref}/package.json`;
        break;
      case InputType.FORGEJO:
        url = `${name}/raw/${ref}/package.json`;
        break;
      default:
        reject(`Wrong type, expected remote git host, got ${input.type}.`);
    }

    return fetch(url)
      .then((resp: Response) => {
        if (resp.status < 200 || resp.status >= 300) {
          reject(`Status of call ${url} is not OK.`);
        }
        return resp.text();
      }).then((text: string) => {
        try {
          resolve(JSON.parse(text));
        } catch (err) {
          reject('Error parsing JSON.');
        }
      }).catch((err) => {
        reject(`Error thrown while gathering manifest from ${url}: ${err}`);
      });
  });
};

// Export private functions only in testing environment
if (process.env['NODE_DEV'] == 'TEST') {
  module.exports.getPackageFromFile = getPackageFromFile;
  module.exports.getPackageFromGit = getPackageFromGit;
  module.exports.getPackageFromNpm = getPackageFromNpm;
  module.exports.getPackageFromRemote = getPackageFromRemote;
}
