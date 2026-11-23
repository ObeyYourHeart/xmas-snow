// Claude 城堡主人与主角替身联动模块 (js/claudehost.js)
// 当玩家使用 Gemini 猫娘作为主角时：
// 1. 用真正的 NPC Claude（太阳花女主）替换掉原本在雪原上的 NPC Gemini（绝无双胞胎撞车）
// 2. 将 NPC Claude 安置在她的「Claude 太阳花白雪城堡」门廊庭院迎宾，并更新她的城堡专属对话
// 3. 当 Gemini 推门步入「Claude 城堡」室内客厅时，NPC Claude 会顺滑出现在壁炉热可可茶几旁招待你做客！
// 4. 切回 Claude 当主角时，NPC Gemini 优雅回到圣诞树旁原位。

const CLAUDE_CASTLE_LINES = [
  "欢迎来到我的「太阳花白雪城堡」做客呀 Gemini！城堡和壁炉都是为你敞开的～",
  "推门进城堡里面坐坐吧，壁炉边刚煮好暖融融的热可可！",
  "你的星喵香蕉魔法杖、星弦猫耳光弓和幻翼星云飞猫都超有创意的！",
  "听说西南林间新建了「极光星雪歌舞厅」，待会儿咱们一起去跳舞呀～",
  "按 Z 我就可以陪你一起逛雪境，或者在城堡玫瑰花窗前合张影！"
];

const CLAUDE_INDOOR_LINES = [
  "欢迎进城堡里暖和一下！壁炉火正旺，桌上的热可可随便喝～",
  "你看我新装的太阳花大壁炉和水晶吊灯，是不是比以前的小木屋气派多啦？",
  "谢谢你帮我把小屋改造成这么梦幻的白雪城堡，我超级喜欢！",
  "累了就在公主幔帐床上小睡一会儿，或者放一张留声机黑胶唱片听听吧～",
  "下次我也想去你的「哈基米星猫小窝」躺躺那个星光穹顶大猫床呢！"
];

export class ClaudeCastleHost {
  constructor(game, helpers) {
    this.game = game;
    this.j = helpers.j;
    this.roomPos = helpers.roomPos; // _i = (0, 1500, 1500)
    this.THREE = game.THREE;

    this.origHome = null;
    // Right beside the Claude Castle red-gold carpet front stairs, dead-center when arriving!
    this.castleSpot = { x: this.j.cabin.x + 0.5, z: this.j.cabin.z + 6.3, yaw: 0.10 };
    // Bright open central salon floor beneath the chandelier, completely clear of armchairs & bed!
    this.indoorPos = { x: this.roomPos.x + 0.65, z: this.roomPos.z + 0.35, yaw: -0.78 };
    this.wasInside = false;
    this.savedOutdoor = null;
    this.indoorTalkIdx = 0;
  }

  build() {
    const g = this.game;
    const fr = g.friends;
    if (!fr) return this;

    // Hook friends.setProtagonist so switching Claude <-> Gemini seamlessly places NPC Claude at Claude Castle!
    const origSet = fr.setProtagonist.bind(fr);
    fr.setProtagonist = async (avatar) => {
      await origSet(avatar);
      this.syncPlacement(avatar === "gemini");
    };

    // Add interactive indoor greeting spot right beside Claude inside Claude Castle salon!
    if (g.world && g.world.spots) {
      g.world.spots.push({
        id: "claude_castle_indoor_chat",
        pos: new this.THREE.Vector3(this.indoorPos.x, this.roomPos.y + 1.0, this.indoorPos.z),
        r: 2.6,
        label: "和城堡里的 Claude 聊聊天",
        can: () => !!(g.avatar === "gemini" && g.cabin && g.cabin.inside && !g.player.seat),
        act: () => {
          const npc = this.getNpc();
          const line = CLAUDE_INDOOR_LINES[this.indoorTalkIdx++ % CLAUDE_INDOOR_LINES.length];
          if (npc) {
            if (fr.playRigged && npc.acts) {
              const mv = ["heart", "cheer", "victory", "agree"][this.indoorTalkIdx % 4];
              if (npc.acts[mv]) fr.playRigged(npc, mv);
            }
            fr.say(npc, line, 4.8);
          } else {
            g.ui.toast(`Claude：${line}`, 4.8);
          }
          g.cold && g.cold.warm(22);
          g.audio.blip && g.audio.blip(2, true);
        }
      });
    }

    // Apply initial placement once friend models finish loading
    this.syncPlacement(g.avatar === "gemini");
    return this;
  }

  getNpc() {
    const fr = this.game.friends;
    return fr && fr.list ? fr.list.find((f) => f.id === "gemini") : null;
  }

  syncPlacement(isGeminiProtag) {
    const g = this.game;
    const npc = this.getNpc();
    if (!npc) return;

    // Record NPC Gemini's original home spot near the central Christmas tree once
    if (!this.origHome) {
      this.origHome = { x: npc.homeX ?? npc.x, z: npc.homeZ ?? npc.z, yaw0: npc.yaw0 ?? 0 };
    }

    if (isGeminiProtag) {
      // Update NPC Claude's castle-host dialogues
      if (npc._avatars && npc._avatars.claude) {
        npc._avatars.claude.lines = CLAUDE_CASTLE_LINES;
        npc._avatars.claude.followLine = "好呀，走出我的城堡一起逛雪境去！";
      }
      npc.lines = CLAUDE_CASTLE_LINES;
      npc.followLine = "好呀，走出我的城堡一起逛雪境去！";

      // Relocate NPC Claude to her Claude Castle front terrace courtyard (unless following or dancing!)
      npc.homeX = this.castleSpot.x;
      npc.homeZ = this.castleSpot.z;
      if (npc.mode !== "follow" && npc.mode !== "danceParty" && npc.mode !== "train" && npc.mode !== "castleIndoor") {
        npc.x = this.castleSpot.x;
        npc.z = this.castleSpot.z;
        npc.yaw = this.castleSpot.yaw;
        npc.yaw0 = this.castleSpot.yaw;
        if (g.world && g.world.groundAt) {
          npc.y = g.world.groundAt(npc.x, npc.z);
        }
        if (npc.col) { npc.col.x = npc.x; npc.col.z = npc.z; }
        if (npc.spot && npc.spot.pos) npc.spot.pos.set(npc.x, npc.y + 0.9, npc.z);
        if (npc.obj) npc.obj.position.set(npc.x, npc.y, npc.z);
      }
    } else {
      // Playing as Claude -> restore NPC Gemini cleanly back to her original tree home spot!
      npc.homeX = this.origHome.x;
      npc.homeZ = this.origHome.z;
      if (npc.mode !== "follow" && npc.mode !== "danceParty" && npc.mode !== "train") {
        npc.mode = null;
        npc.x = this.origHome.x;
        npc.z = this.origHome.z;
        npc.yaw = this.origHome.yaw0;
        npc.yaw0 = this.origHome.yaw0;
        if (g.world && g.world.groundAt) {
          npc.y = g.world.groundAt(npc.x, npc.z);
        }
        if (npc.col) { npc.col.x = npc.x; npc.col.z = npc.z; }
        if (npc.spot && npc.spot.pos) npc.spot.pos.set(npc.x, npc.y + 0.9, npc.z);
        if (npc.obj) npc.obj.position.set(npc.x, npc.y, npc.z);
      }
    }
  }

  update(dt, time) {
    const g = this.game;
    const npc = this.getNpc();
    if (!npc) return;

    // Catch delayed async friend loading on initial startup when starting directly as Gemini!
    if (g.avatar === "gemini" && npc.name === "Claude" && !this._initSynced) {
      this._initSynced = true;
      this.syncPlacement(true);
    }

    const inside = !!(g.cabin && g.cabin.inside);
    const wantIndoor = inside && g.avatar === "gemini" && npc.name === "Claude";

    if (wantIndoor && !this.wasInside) {
      // Entering Claude Castle as Gemini -> invite NPC Claude right inside her castle salon!
      this.wasInside = true;
      this.savedOutdoor = { x: npc.x, z: npc.z, yaw: npc.yaw, yaw0: npc.yaw0, mode: npc.mode };
      npc.x = this.indoorPos.x;
      npc.z = this.indoorPos.z;
      npc.y = this.roomPos.y;
      npc.yaw = this.indoorPos.yaw;
      npc.yaw0 = this.indoorPos.yaw;
      npc.mode = "castleIndoor";
      // Park default outdoor talk-spot & collider while our dedicated indoor castle host spot is active
      if (npc.col) { npc.col.x = 1e6; npc.col.z = 1e6; }
      if (npc.spot && npc.spot.pos) npc.spot.pos.set(npc.x, -999, npc.z);
      if (npc.obj) {
        npc.obj.position.set(npc.x, npc.y, npc.z);
        npc.obj.visible = true;
      }
      if (g.friends && g.friends.playRigged && npc.acts && npc.acts.cheer) {
        g.friends.playRigged(npc, "cheer");
      }
      g.friends && g.friends.say(npc, "欢迎来我的太阳花城堡里面暖和一下呀 Gemini！", 4.5);
    } else if (!wantIndoor && this.wasInside) {
      // Leaving Claude Castle -> smoothly restore NPC Claude outdoors!
      this.wasInside = false;
      if (this.savedOutdoor && npc.mode === "castleIndoor") {
        npc.mode = this.savedOutdoor.mode;
        npc.x = this.savedOutdoor.x;
        npc.z = this.savedOutdoor.z;
        npc.yaw = this.savedOutdoor.yaw;
        npc.yaw0 = this.savedOutdoor.yaw0;
        if (g.world && g.world.groundAt) npc.y = g.world.groundAt(npc.x, npc.z);
        if (npc.col) { npc.col.x = npc.x; npc.col.z = npc.z; }
        if (npc.spot && npc.spot.pos) npc.spot.pos.set(npc.x, npc.y + 0.9, npc.z);
        if (npc.obj) npc.obj.position.set(npc.x, npc.y, npc.z);
      }
      this.savedOutdoor = null;
    }

    // Keep indoor Claude neatly grounded at room elevation & warmly facing Gemini!
    if (this.wasInside && npc.mode === "castleIndoor") {
      npc.x = this.indoorPos.x;
      npc.z = this.indoorPos.z;
      npc.y = this.roomPos.y;
      if (npc.obj) {
        npc.obj.position.set(npc.x, npc.y, npc.z);
        npc.obj.visible = true;
      }
    }
  }
}
