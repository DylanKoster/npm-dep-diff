process.env['NODE_DEV'] = 'TEST';

// @ts-expect-error
import { getPackageFromFile, InputSource, InputType } from '../../src/input';

describe('test getPackageFromFile function', () => {
  it('should return valid JSON on correct input', async () => {
    const json: object = await getPackageFromFile({
      type: InputType.FILE,
      source: 'tests/files/package-2.json',
    } as InputSource);

    expect(Object.keys(json)).toContain('dependencies');
    expect(Object.keys(json)).toContain('bin');
    expect(Object.keys(json)).toContain('author');
  });

  it('should throw an error on an non-existing file.', () => {
    expect(async () => {
      await getPackageFromFile({
        type: InputType.FILE,
        source: 'tests/files/package-nonexistant.json',
      } as InputSource);
    }).rejects.toThrow(Error);
  });

  it('should throw an error when the file does not contain json', () => {
    expect(async () => {
      await getPackageFromFile({
        type: InputType.FILE,
        source: 'tests/files/text.txt',
      } as InputSource);
    }).rejects.toThrow(SyntaxError);
  });
});
