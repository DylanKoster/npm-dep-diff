import fs from 'fs';
import simpleGit from 'simple-git';

export const enum InputType {
  NPM = 'npm',
  GIT = 'git',
  FILE = 'file',
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

    fs.readFile(input.source, encoding, (err, src) => {
      if (err) rejects(`Error reading file ${input.source}`);
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
          return Promise.reject(
            `Status of call https://registry.npmjs.org/${name} is not OK.`,
          );
        }

        return resp.json();
      })
      .then((json: object) => {
        if (!json || !json['versions']) {
          return Promise.reject('JSON result is null');
        }
        if (version !== 'latest') return [json['versions'], version];

        const keys: string[] = Object.keys(json['versions']);
        return [json['versions'], keys[keys.length - 1]];
      })
      .then(([versions, version]: [object, string]) => {
        resolve(versions[version]);
      })
      .catch((err) => {
        reject(`Error thrown while gathering manifest for ${src}: ${err}`);
      });
  });
}

// Export private functions only in testing environment
if (process.env['NODE_DEV'] == 'TEST') {
  module.exports.getPackageFromFile = getPackageFromFile;
  module.exports.getPackageFromGit = getPackageFromGit;
  module.exports.getPackageFromNpm = getPackageFromNpm;
}
