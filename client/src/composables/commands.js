import { ref } from "vue";

// This file only contains mock commands for now

export function useCommands(recentCommandCount = 5) {
    const commands = ref(allCommands);
    const recentCommands = ref([]);

    const runCommand = (command) => {
        const args = command.split(" ");
        const c = args.splice(0, 1)[0];

        const commandObject = commands.value.find((o) => o.command.toLowerCase() === c.toLowerCase());

        if (commandObject) {
            // add command to beginning of recent commands, making sure there is only one copy
            const index = recentCommands.value.indexOf(commandObject);
            if (index !== -1) {
                recentCommands.value.splice(index, 1);
            }
            recentCommands.value.unshift(commandObject);
            recentCommands.value = recentCommands.value.slice(-recentCommandCount);

            console.log(`Ran command: ${commandObject.name} with arguments: ${args}`);
        } else {
            console.log(`Command ${c} not found`);
        }
    };

    return { commands, recentCommands, runCommand };
}

const allCommands = [
    {
        name: "Concatenate datasets",
        command: "t:cat",
    },
    {
        name: "Join",
        command: "t:join",
    },
    {
        name: "Unique",
        command: "t:unique",
    },
    {
        name: "Search in textfiles",
        command: "t:grep",
    },
    {
        name: "Trim",
        command: "t:trim",
    },
    {
        name: "Concatenate datasets Reverse",
        command: "t:tac",
    },
    {
        name: "Upload Data",
        command: "o:upload",
    },
    {
        name: "Extract Workflow",
        command: "o:to-workflow",
    },
    {
        name: "Rename History",
        command: "o:rename-history",
    },
    {
        name: "Switch to History",
        command: "o:switch-history",
    },
    {
        name: "Create new History",
        command: "o:create-history",
    },
    {
        name: "Search Datasets",
        command: "o:search",
    },
    {
        name: "Rename Most Recent Dataset",
        command: "o:rename-last",
    },
    {
        name: "Trackster",
        command: "v:trackster",
    },
    {
        name: "Audio Player",
        command: "v:audio-player",
    },
    {
        name: "Bar Horizontal (NVD3)",
        command: "v:bar-h",
    },
    {
        name: "Bar Horizontal Stacked (NVD3)",
        command: "v:bar-h-stacked",
    },
    {
        name: "Bar Diagram (jqPlot)",
        command: "v:bar-diagram",
    },
    {
        name: "Box Plot (jqPlot)",
        command: "v:box-plot",
    },
];
