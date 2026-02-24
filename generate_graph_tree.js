const madge = require('madge');
const fs = require('fs');
const { execSync } = require('child_process');

const config = {
	tsConfig: './tsconfig.json',
	fileExtensions: ['ts', 'tsx', 'js', 'jsx'],
	excludeRegExp: [/node_modules/, /\.d\.ts$/],
	baseDir: '.'
};

madge('./', config).then((res) => {
	const tree = res.obj();

	// 1. HEADER (Including your requested ELK layout)
	let mermaid = `---\nconfig:\n  layout: elk\n---\ngraph TD\n`;

	const sanitize = (name) => name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "_");

	const groups = { Screens: [], Auth: [], Hooks: [], Utils: [], Other: [] };

	Object.keys(tree).forEach(file => {
		const id = sanitize(file);
		const label = file.replace(/\.[^/.]+$/, "");
		const entry = `    ${id}["${label}"]`;

		if (file.includes('(MainApp)')) groups.Screens.push(entry);
		else if (file.includes('(auth)')) groups.Auth.push(entry);
		else if (file.includes('hooks/')) groups.Hooks.push(entry);
		else if (file.includes('utils/')) groups.Utils.push(entry);
		else groups.Other.push(entry);
	});

	for (const [group, nodes] of Object.entries(groups)) {
		if (nodes.length > 0) {
			mermaid += `  subgraph ${group}\n${nodes.join('\n')}\n  end\n`;
		}
	}

	Object.keys(tree).forEach(file => {
		const sourceId = sanitize(file);
		tree[file].forEach(dep => {
			const targetId = sanitize(dep);
			mermaid += `    ${sourceId} --> ${targetId}\n`;
		});
	});

	// 2. SAVE THE .MMD FILE
	fs.writeFileSync('architecture.mmd', mermaid);
	console.log('✅ architecture.mmd generated.');

	// 3. GENERATE THE .SVG LOCALLY
	try {
		console.log('🎨 Generating SVG diagram...');
		// We use npx to ensure we use the local version we just installed
		execSync('npx mmdc -i architecture.mmd -o architecture.svg -b white');
		console.log('🚀 Success! architecture.svg is ready.');
	} catch (error) {
		console.error('❌ Failed to generate SVG. Make sure @mermaid-js/mermaid-cli is installed.');
		console.error(error.message);
	}
});