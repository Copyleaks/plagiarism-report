const cpx = require('cpx');

const filesToCopy = [
	{
		source: 'projects/plagiarism-report/src/lib/plagiarism-report/assets/*.css',
		dest: 'dist/plagiarism-report/lib/plagiarism-report/assets',
	},
];

filesToCopy.forEach(({ source, dest }) => cpx.copySync(source, dest));
