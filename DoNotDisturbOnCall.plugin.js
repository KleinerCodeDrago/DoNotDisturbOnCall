/**
 * @name AutoDNDOnCall
 * @description Automatically sets your Discord status to 'Do Not Disturb' when you join a voice channel and reverts it back when you leave the channel.
 * @version 1.0.5
 * @author Yuna
 * @source https://github.com/KleinerCodeDrago/DoNotDisturbOnCall
 */

const config = {
    info: {
        name: "DoNotDisturbOnCall",
        authors: [
            {
                name: "Yuna",
                github_username: "KleinerCodeDrago",
            }
        ],
        version: "1.0.5",
        description: "Automatically sets your Discord status to 'Do Not Disturb' when you join a voice channel and reverts it back when you leave the channel.",
        github: "https://github.com/YourGitHub/AutoDNDOnCall",
        github_raw: "https://raw.githubusercontent.com/KleinerCodeDrago/DoNotDisturbOnCall/main/DoNotDisturbOnCall.plugin.js"
    },
    defaultConfig: []
};

module.exports = !global.ZeresPluginLibrary ? class {
    constructor() {
        this._config = config;
    }

    load() { }
    start() { }
    stop() { }
} : (([Plugin, Library]) => {
    const { DiscordModules } = Library;
    const { SelectedChannelStore } = DiscordModules;
    const UserSettingsProtoStore = BdApi.Webpack.getModule(
        m => m && typeof m.getName === "function" && m.getName() === "UserSettingsProtoStore",
        { first: true, searchExports: true }
    );
    const UserSettingsProtoUtils = BdApi.Webpack.getModule(
        m => m.ProtoClass && m.ProtoClass.typeName.endsWith(".PreloadedUserSettings"),
        { first: true, searchExports: true }
    );

    class AutoDNDOnCall extends Plugin {
        constructor() {
            super();
            this.originalStatus = null;
            this.interval = null;
        }

        onStart() {
            this.interval = setInterval(() => {
                const voiceChannelId = SelectedChannelStore.getVoiceChannelId();
                if (voiceChannelId && !this.originalStatus) {
                    this.originalStatus = this.getCurrentStatus();
                    this.updateStatus('dnd');
                } else if (!voiceChannelId && this.originalStatus) {
                    this.updateStatus(this.originalStatus);
                    this.originalStatus = null;
                }
            }, 1000); // Check every second
        }

        onStop() {
            if (this.interval) clearInterval(this.interval);
        }

        getCurrentStatus() {
            return UserSettingsProtoStore.settings.status.status.value;
        }

        updateStatus(status) {
            UserSettingsProtoUtils.updateAsync(
                "status",
                statusSetting => {
                    statusSetting.status.value = status;
                },
                0
            );
        }
    }

    return AutoDNDOnCall;
})(global.ZeresPluginLibrary.buildPlugin(config));
