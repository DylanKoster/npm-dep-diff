import { exec } from 'child_process';

const cli: string = 'node dist/cli.js';
const timeout: number = 10000;

describe('CLI Integration Tests', () => {
  it(
    'should compare two package.json files',
    (done) => {
      exec(
        `${cli} file:tests/files/package-1.json file:tests/files/package-2.json`,
        (err, stdout, stderr) => {
          expect(err).toBeNull();
          expect(stderr).toBe('');
          expect(stdout).toContain('dependencies');
          expect(stdout).toContain('added');
          expect(stdout).toContain('removed');
          done();
        },
      );
    },
    timeout,
  );

  it(
    'should output in JSON format',
    (done) => {
      exec(
        `${cli} file:tests/files/package-1.json file:tests/files/package-2.json --output json`,
        (err, stdout, stderr) => {
          expect(err).toBeNull();
          expect(stderr).toBe('');
          const output = JSON.parse(stdout);
          expect(output).toHaveProperty('dependencies');
          expect(output).toHaveProperty('devDependencies');
          expect(output).toHaveProperty('peerDependencies');
          expect(Array.isArray(output.dependencies)).toBe(true);
          expect(Array.isArray(output.devDependencies)).toBe(true);
          expect(Array.isArray(output.peerDependencies)).toBe(true);
          done();
        },
      );
    },
    timeout,
  );

  it(
    'should handle npm package comparison',
    (done) => {
      // Use a stable package
      exec(`${cli} npm:chalk@4.1.2 npm:chalk@5.0.0`, (err, stdout, stderr) => {
        expect(err).toBeNull();
        expect(stderr).toBe('');
        expect(stdout).toContain('dependencies');
        expect(stdout).toContain('+ c8');
        expect(stdout).toContain('^7.10.0');
        expect(stdout).toContain('- coveralls');
        expect(stdout).toContain('^3.0.7');
        expect(stdout).toContain('~ ava');
        expect(stdout).toContain('^2.4.0');
        expect(stdout).toContain('→');
        expect(stdout).toContain('^0.19.0');
        expect(stdout).toContain('minor');
        expect(stdout).toContain('major');
        done();
      });
    },
    timeout,
  );

  it(
    'should handle git reference comparison',
    (done) => {
      exec(
        `${cli} git:f7df31a9695caf98644cd3fa2e83545d7f3f71cb git:1c9eadabfbafabbe48d46dd748c8de1635f9a4d9`,
        (err, stdout, stderr) => {
          expect(err).toBeNull();
          expect(stderr).toBe('');
          expect(stdout).toContain('dependencies');
          expect(stdout).toContain('- chalk');
          expect(stdout).toContain('^5.6.2');
          expect(stdout).toContain('- jest');
          expect(stdout).toContain('^30.2.0');
          expect(stdout).toContain('No changes found in peerDependencies');
          done();
        },
      );
    },
    timeout,
  );

  it(
    'should handle cross-reference comparison',
    (done) => {
      exec(
        `${cli} npm:npm-dep-diff@1.0.0 git:44973b2b024c94ac406287d68fe04f6d96cfea17`,
        (err, stdout, stderr) => {
          expect(err).toBeNull();
          expect(stderr).toBe('');
          expect(stdout).toContain('dependencies');
          expect(stdout).toContain('- @types/yargs');
          expect(stdout).toContain('^17.0.34');
          expect(stdout).toContain('- jest');
          expect(stdout).toContain('^30.2.0');
          expect(stdout).toContain('No changes found in peerDependencies');
          done();
        },
      );
    },
    timeout,
  );

  it(
    'should show only dependencies section',
    (done) => {
      exec(
        `${cli} file:tests/files/package-1.json file:tests/files/package-2.json --section deps`,
        (err, stdout, stderr) => {
          expect(err).toBeNull();
          expect(stderr).toBe('');
          expect(stdout).toContain('dependencies');
          expect(stdout).not.toContain('devDependencies');
          done();
        },
      );
    },
    timeout,
  );

  it(
    'should handle invalid input',
    (done) => {
      exec(`${cli} invalid:input`, (err, stdout, stderr) => {
        expect(err).not.toBeNull();
        expect(err?.code).toBe(1);
        expect(stderr).toContain('Not enough non-option arguments');
        done();
      });
    },
    timeout,
  );

  it('should output with correct colors', (done) => {
    exec(
      `${cli} file:tests/files/package-3.json file:tests/files/package-6.json`, {timeout: 10000, },
      (err, stdout, stderr) => {
        expect(err).toBeNull();
        expect(stderr).toBe('');
        // Test for ANSI color codes
        // Orange for major changes
        console.log("orange");
        const orange: string = '\x1b[38;2;255;165;0m';
        expect(stdout).toContain(`${orange}~ react`);
        expect(stdout).toContain(`${orange}^18.3.1`);
        expect(stdout).toContain(`${orange}→`);
        expect(stdout).toContain(`${orange}^19.2.0`);
        expect(stdout).toContain(`${orange}major`);

        // Cyan dependency header titles
        console.log("cyan");
        const cyan: string = '\u001b[36m';
        expect(stdout).toContain(`${cyan}dependencies`); // Cya ANSI escape code
        expect(stdout).toContain(`${cyan}devDependencies`); // Cya ANSI escape code
        expect(stdout).toContain(`${cyan}peerDependencies`); // Cya ANSI escape code
        
        // Gray header column labels
        console.log("gray");
        const gray: string = `\u001b[90m`;
        expect(stdout).toContain(`${gray}from`);
        expect(stdout).toContain(`${gray}→`);
        expect(stdout).toContain(`${gray}to`);
        expect(stdout).toContain(`${gray}type`);
        
        // Green for added dependencies
        console.log("green");
        const green: string = '\u001b[32m';
        expect(stdout).toContain(`${green}+ next`);
        expect(stdout).toContain(`${green}15.0.0`);
        expect(stdout).toContain(`${green}added`); 

        // Red for removed dependencies
        console.log("red");
        const red: string = '\u001b[91m';
        expect(stdout).toContain(`${red}- vite`);
        expect(stdout).toContain(`${red}^5.2.0`);
        expect(stdout).toContain(`${red}removed`);
        
        // Yellow for minor and patch changes
        console.log("yellow");
        const yellow: string = '\u001b[33m';
        expect(stdout).toContain(`${yellow}~ eslint`);
        expect(stdout).toContain(`${yellow}^9.4.0`);
        expect(stdout).toContain(`${yellow}→`);
        expect(stdout).toContain(`${yellow}^9.5.0`);
        expect(stdout).toContain(`${yellow}minor`);

        const yellowBright: string = '\u001b[93m';

        expect(stdout).toContain(`${yellowBright}~ tailwindcss`);
        expect(stdout).toContain(`${yellowBright}^3.4.9`);
        expect(stdout).toContain(`${yellowBright}→`);
        expect(stdout).toContain(`${yellowBright}^3.4.10`);
        expect(stdout).toContain(`${yellowBright}patch`);

        done();
      },
    );
  });
});
