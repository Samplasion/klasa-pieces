const { Command } = require('klasa');
const snekfetch = require('snekfetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Searches the Urban Dictionary library for a definition to the search term.',
			usage: '<search:str> [resultNum:int]',
			usageDelim: ', '
		});
	}

	async run(msg, [search, index = 1]) {
		const body = await snekfetch.get(`http://api.urbandictionary.com/v0/define?term=${encodeURIComponent(search)}`)
			.then(data => JSON.parse(data.text));

		const definition = this.getDefinition(search, body, --index);
		return msg.sendMessage(definition);
	}

	getDefinition(search, body, index) {
		const result = body.list[index];
		if (!result) throw 'No entry found.';

		const wdef = result.definition.length > 1000 ?
			`${this.splitText(result.definition, 1000)}...` :
			result.definition;

		return [
			`**Word:** ${search}`,
			`\n**Definition:** ${index + 1} out of ${body.list.length}\n_${wdef}_`,
			`\n**Example:**\n${result.example}`,
			`\n**${result.thumbs_up}** 👍 | **${result.thumbs_down}** 👎`,
			`\n*By ${result.author}*`,
			`\n**Tags**: ${body.tags.join(', ')}`,
			`<${result.permalink}>`
		].join('\n');
	}

	splitText(string, length, endBy = ' ') {
		const a = string.substring(0, length).lastIndexOf(endBy);
		const pos = a === -1 ? length : a;
		return string.substring(0, pos);
	}

};
