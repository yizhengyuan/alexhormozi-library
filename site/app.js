(function () {
  "use strict";

  const REPO = "https://github.com/yizhengyuan/alexhormozi-library";
  const BLOB = REPO + "/blob/main/";

  const NODES = [
    {
      id: "overview",
      file: "system/README.md",
      title: "总览",
      en: "",
      role: "overview",
      lead: "官方三问是骨架；交付和原则是本库的整理分篇",
    },
    {
      id: "market",
      file: "system/01-market.md",
      title: "市场",
      en: "",
      role: "editorial",
      num: "01",
      lead: "谁足够饿、有支付能力、并且能被稳定触达",
    },
    {
      id: "offers",
      file: "system/02-offers.md",
      title: "要约",
      en: "Offers",
      role: "official",
      num: "02",
      question: "我卖什么？",
      book: "$100M Offers",
      lead: "好到让人拒绝会觉得亏",
    },
    {
      id: "leads",
      file: "system/03-leads.md",
      title: "获客",
      en: "Leads",
      role: "official",
      num: "03",
      question: "怎样让人知道？",
      book: "$100M Leads",
      lead: "让陌生人愿意买",
    },
    {
      id: "money",
      file: "system/04-money-models.md",
      title: "赚钱模型",
      en: "Money Models",
      role: "official",
      num: "04",
      question: "怎样从中赚钱？",
      book: "$100M Money Models",
      lead: "吸引、升单、降单、持续收费",
    },
    {
      id: "delivery",
      file: "system/05-delivery.md",
      title: "交付",
      en: "",
      role: "editorial",
      num: "05",
      lead: "结果必须兑现，否则模型会塌",
    },
    {
      id: "principles",
      file: "system/06-principles.md",
      title: "底层原则",
      en: "",
      role: "editorial",
      num: "06",
      lead: "量、约束、价格与检验标准",
    },
  ];

  const SOURCE_FILES = [
    { id: "books", file: "sources/books.md", title: "书" },
    { id: "videos", file: "sources/videos.md", title: "视频" },
    { id: "podcasts", file: "sources/podcasts.md", title: "播客" },
    { id: "interviews", file: "sources/interviews.md", title: "访谈" },
    { id: "other", file: "sources/other.md", title: "其他" },
  ];

  const LINKS = [
    { from: "market", to: "offers", style: "dash", label: "整理分篇" },
    { from: "offers", to: "leads", style: "solid" },
    { from: "leads", to: "money", style: "solid" },
    { from: "offers", to: "delivery", style: "dash" },
    { from: "leads", to: "delivery", style: "dash" },
    { from: "money", to: "delivery", style: "dash" },
  ];

  const FILE_TO_HASH = {
    "system/README.md": "#/",
    "README.md": "#/",
    "01-market.md": "#/system/market",
    "system/01-market.md": "#/system/market",
    "02-offers.md": "#/system/offers",
    "system/02-offers.md": "#/system/offers",
    "03-leads.md": "#/system/leads",
    "system/03-leads.md": "#/system/leads",
    "04-money-models.md": "#/system/money",
    "system/04-money-models.md": "#/system/money",
    "05-delivery.md": "#/system/delivery",
    "system/05-delivery.md": "#/system/delivery",
    "06-principles.md": "#/system/principles",
    "system/06-principles.md": "#/system/principles",
    "RULES.md": "#/rules",
    "sources/books.md": "#/sources/books",
    "sources/videos.md": "#/sources/videos",
    "sources/podcasts.md": "#/sources/podcasts",
    "sources/interviews.md": "#/sources/interviews",
    "sources/other.md": "#/sources/other",
    "books.md": "#/sources/books",
    "videos.md": "#/sources/videos",
    "podcasts.md": "#/sources/podcasts",
    "interviews.md": "#/sources/interviews",
    "other.md": "#/sources/other",
    "notes/README.md": "#/sources",
    "inbox/README.md": "#/sources",
    "sources/": "#/sources",
    "sources": "#/sources",
  };

  let DATA = null;

  function basePath() {
    var p = location.pathname;
    if (p.endsWith("/index.html")) return p.slice(0, -10);
    if (p.endsWith("/")) return p;
    return p + "/";
  }

  function fetchText(rel) {
    return fetch(basePath() + rel, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error("无法读取 " + rel + "（" + r.status + "）");
      return r.text();
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function rewriteHref(href) {
    var raw = href.trim();
    var path = raw.replace(/^\.\.\//, "").replace(/^\.\//, "");
    if (FILE_TO_HASH[path] || FILE_TO_HASH[raw]) {
      return { href: FILE_TO_HASH[path] || FILE_TO_HASH[raw], external: false };
    }
    var leaf = path.split("/").pop();
    if (FILE_TO_HASH[leaf]) return { href: FILE_TO_HASH[leaf], external: false };
    if (/^https?:\/\//i.test(raw) || raw.startsWith("mailto:")) {
      return { href: raw, external: true };
    }
    return { href: BLOB + path, external: true };
  }

  function inlineMd(s) {
    var parts = [];
    var rest = s;
    var re = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(_[^_]+_)|(\[[^\]]+\]\([^)]+\))/g;
    var last = 0;
    var m;
    while ((m = re.exec(s))) {
      parts.push(escapeHtml(s.slice(last, m.index)));
      var tok = m[0];
      if (tok.charAt(0) === "`") {
        parts.push("<code>" + escapeHtml(tok.slice(1, -1)) + "</code>");
      } else if (tok.slice(0, 2) === "**") {
        parts.push("<strong>" + escapeHtml(tok.slice(2, -2)) + "</strong>");
      } else if (tok.charAt(0) === "*" || tok.charAt(0) === "_") {
        parts.push("<em>" + escapeHtml(tok.slice(1, -1)) + "</em>");
      } else if (tok.charAt(0) === "[") {
        var lm = tok.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        var dest = rewriteHref(lm[2]);
        var linkText = lm[1].replace(/^`|`$/g, "");
        var extra = dest.external
          ? ' rel="noopener noreferrer" target="_blank"'
          : "";
        parts.push(
          '<a href="' +
            escapeHtml(dest.href) +
            '"' +
            extra +
            ">" +
            escapeHtml(lm[1]) +
            "</a>"
        );
      }
      last = m.index + tok.length;
    }
    parts.push(escapeHtml(s.slice(last)));
    return parts.join("");
  }

  function stripFrontmatter(md) {
    var meta = {};
    var body = md;
    if (md.indexOf("---") === 0) {
      var end = md.indexOf("\n---", 3);
      if (end !== -1) {
        md.slice(3, end)
          .split("\n")
          .forEach(function (line) {
            var i = line.indexOf(":");
            if (i > 0) {
              meta[line.slice(0, i).trim()] = line
                .slice(i + 1)
                .trim()
                .replace(/^["']|["']$/g, "");
            }
          });
        body = md.slice(end + 4).replace(/^\s+/, "");
      }
    }
    return { meta: meta, body: body };
  }

  function splitSections(body) {
    var lines = body.replace(/\r\n/g, "\n").split("\n");
    var sections = [];
    var current = { level: 0, title: "", content: [] };
    lines.forEach(function (line) {
      var h = /^(#{1,3})\s+(.+)\s*$/.exec(line);
      if (h) {
        sections.push(current);
        current = { level: h[1].length, title: h[2].trim(), content: [] };
      } else {
        current.content.push(line);
      }
    });
    sections.push(current);
    return sections;
  }

  function parseTable(text) {
    var lines = text.split("\n").filter(function (l) {
      return l.trim().charAt(0) === "|";
    });
    if (lines.length < 2) return { headers: [], rows: [] };
    var headers = lines[0]
      .split("|")
      .slice(1, -1)
      .map(function (c) {
        return c.trim();
      });
    var rows = [];
    lines.slice(2).forEach(function (line) {
      var cells = line
        .split("|")
        .slice(1, -1)
        .map(function (c) {
          return c.trim();
        });
      if (cells.length) {
        var obj = {};
        headers.forEach(function (h, i) {
          obj[h] = cells[i] || "";
        });
        rows.push(obj);
      }
    });
    return { headers: headers, rows: rows };
  }

  function isPending(text) {
    return /待核对|待补|尚未|暂空|暂不|未升格/.test(text || "");
  }

  function stripSourceTag(s) {
    return (s || "").replace(/^`source:\s*\w+`\s*/gm, "").trim();
  }

  function parseQuotes(text) {
    var lines = text.replace(/\r\n/g, "\n").split("\n");
    var quotes = [];
    var intro = [];
    var after = [];
    var buffer = [];
    var seenQuote = false;
    var i = 0;

    function flushBuffer() {
      var dest = seenQuote ? after : intro;
      for (var b = 0; b < buffer.length; b++) dest.push(buffer[b]);
      buffer = [];
    }

    while (i < lines.length) {
      if (/^>\s*/.test(lines[i])) {
        while (buffer.length && !buffer[buffer.length - 1].trim()) buffer.pop();
        var topic = "";
        if (buffer.length) {
          var last = buffer[buffer.length - 1].trim();
          if (/[：:]$/.test(last) && last.length < 80) {
            topic = last.replace(/[：:]$/, "");
            buffer.pop();
          }
        }
        flushBuffer();
        var qLines = [];
        while (i < lines.length && /^>\s*/.test(lines[i])) {
          qLines.push(lines[i].replace(/^>\s?/, ""));
          i++;
        }
        var en = qLines.join(" ").trim().replace(/^["“]|["”]$/g, "");
        while (i < lines.length && lines[i].trim() === "") i++;
        var zh = "";
        if (i < lines.length && /^[（(]/.test(lines[i].trim())) {
          zh = lines[i].trim().replace(/^[（(]/, "").replace(/[）)]$/, "");
          i++;
        }
        while (i < lines.length && lines[i].trim() === "") i++;
        var src = "";
        if (i < lines.length && /^出处[：:]/.test(lines[i].trim())) {
          src = lines[i].trim().replace(/^出处[：:]\s*/, "");
          i++;
          while (
            i < lines.length &&
            lines[i].trim() !== "" &&
            !/^>\s*/.test(lines[i]) &&
            !/^出处[：:]/.test(lines[i].trim())
          ) {
            if (/^#{1,3}\s/.test(lines[i])) break;
            src += " " + lines[i].trim();
            i++;
          }
        }
        quotes.push({ en: en, zh: zh, source: src, topic: topic });
        seenQuote = true;
      } else {
        buffer.push(lines[i]);
        i++;
      }
    }
    flushBuffer();
    return {
      quotes: quotes,
      intro: stripSourceTag(intro.join("\n")),
      after: stripSourceTag(after.join("\n")),
    };
  }

  function renderBlocks(text) {
    if (!text || !text.trim()) return "";
    var lines = text.replace(/\r\n/g, "\n").split("\n");
    var html = [];
    var i = 0;
    while (i < lines.length) {
      var line = lines[i];
      if (line.trim() === "") {
        i++;
        continue;
      }
      if (line.trim().charAt(0) === "|" && i + 1 < lines.length && /\|[\s:-]+\|/.test(lines[i + 1] || "")) {
        var chunk = [];
        while (i < lines.length && lines[i].trim().charAt(0) === "|") {
          chunk.push(lines[i]);
          i++;
        }
        html.push(renderTable(parseTable(chunk.join("\n"))));
        continue;
      }
      if (/^[-*] /.test(line) || /^\d+\. /.test(line)) {
        var ordered = /^\d+\. /.test(line);
        var items = [];
        while (i < lines.length && (/^[-*] /.test(lines[i]) || /^\d+\. /.test(lines[i]))) {
          items.push("<li>" + inlineMd(lines[i].replace(/^([-*] |\d+\. )/, "")) + "</li>");
          i++;
        }
        html.push((ordered ? "<ol>" : "<ul>") + items.join("") + (ordered ? "</ol>" : "</ul>"));
        continue;
      }
      if (/^#{1,3}\s/.test(line)) {
        var hm = /^(#{1,3})\s+(.+)$/.exec(line);
        var tag = "h" + (hm[1].length + 1);
        html.push("<" + tag + ">" + inlineMd(hm[2]) + "</" + tag + ">");
        i++;
        continue;
      }
      var para = [line];
      i++;
      while (
        i < lines.length &&
        lines[i].trim() !== "" &&
        lines[i].trim().charAt(0) !== "|" &&
        !/^[-*] /.test(lines[i]) &&
        !/^\d+\. /.test(lines[i]) &&
        !/^#{1,3}\s/.test(lines[i]) &&
        !/^>\s*/.test(lines[i])
      ) {
        para.push(lines[i]);
        i++;
      }
      var joined = para.join("\n").trim();
      if (joined === "---" || /^`source:/.test(joined)) continue;
      html.push("<p>" + inlineMd(joined) + "</p>");
    }
    return '<div class="prose">' + html.join("") + "</div>";
  }

  function renderTable(tbl) {
    if (!tbl.rows.length) return "";
    var thead =
      "<thead><tr>" +
      tbl.headers
        .map(function (h) {
          return "<th>" + escapeHtml(h) + "</th>";
        })
        .join("") +
      "</tr></thead>";
    var tbody =
      "<tbody>" +
      tbl.rows
        .map(function (row) {
          var pending = isPending(
            tbl.headers
              .map(function (h) {
                return row[h];
              })
              .join(" ")
          );
          var tds = tbl.headers
            .map(function (h) {
              return "<td>" + inlineMd(row[h] || "") + "</td>";
            })
            .join("");
          return '<tr class="' + (pending ? "is-pending" : "") + '">' + tds + "</tr>";
        })
        .join("") +
      "</tbody>";
    return '<div class="table-scroll"><table>' + thead + tbody + "</table></div>";
  }

  function parseSystemPage(md, node) {
    var parsed = stripFrontmatter(md);
    var sections = splitSections(parsed.body);
    var page = {
      id: node.id,
      file: node.file,
      title: parsed.meta.title || node.title,
      source: parsed.meta.source || "",
      status: parsed.meta.status || "",
      updated: parsed.meta.updated || "",
      intro: "",
      quotes: [],
      publicProse: "",
      publicEmpty: false,
      synthesis: "",
      timeline: { headers: [], rows: [] },
    };
    sections.forEach(function (sec) {
      var t = sec.title;
      var c = sec.content.join("\n").trim();
      if (sec.level === 1) {
        page.intro = c;
      } else if (t.indexOf("短引") !== -1) {
        var q = parseQuotes(c);
        page.quotes = q.quotes;
        page.publicIntro = q.intro;
        page.publicAfter = q.after;
        page.publicEmpty =
          page.quotes.length === 0 && /留空|没有把|还没有对到可直接引用/.test(c);
      } else if (t.indexOf("我们的整理") !== -1) {
        page.synthesis = c;
      } else if (t.indexOf("概念时间") !== -1) {
        page.timeline = parseTable(c);
        var before = c.split("\n").filter(function (l) {
          return l.trim() && l.trim().charAt(0) !== "|";
        });
        page.timelineNote = before.join("\n");
      } else if (t === "地图" || t === "编辑说明") {
        page[t] = c;
      }
    });
    return page;
  }

  function parseSourcePage(md, cat) {
    var parsed = stripFrontmatter(md);
    var body = parsed.body.replace(/^#\s+.+\n+/, "");
    var tableIdx = body.indexOf("\n|");
    if (body.charAt(0) === "|") tableIdx = 0;
    var intro = "";
    var tableText = body;
    if (tableIdx >= 0) {
      intro = body.slice(0, tableIdx === 0 ? 0 : tableIdx).trim();
      tableText = body.slice(tableIdx).trim();
    }
    var tbl = parseTable(tableText);
    return { id: cat.id, title: cat.title, file: cat.file, intro: intro, table: tbl };
  }

  function hasPublicQuotes(page) {
    return page.quotes && page.quotes.length > 0;
  }

  function loadAll() {
    var jobs = NODES.map(function (n) {
      return fetchText(n.file).then(function (t) {
        return parseSystemPage(t, n);
      });
    });
    var srcJobs = SOURCE_FILES.map(function (c) {
      return fetchText(c.file).then(function (t) {
        return parseSourcePage(t, c);
      });
    });
    var rules = fetchText("RULES.md");
    var notes = fetchText("notes/README.md");
    var inbox = fetchText("inbox/README.md");
    return Promise.all([Promise.all(jobs), Promise.all(srcJobs), rules, notes, inbox]).then(
      function (parts) {
        var byId = {};
        parts[0].forEach(function (p) {
          byId[p.id] = p;
        });
        var sources = {};
        parts[1].forEach(function (p) {
          sources[p.id] = p;
        });
        return {
          pages: byId,
          sources: sources,
          rules: parts[2],
          notesIntro: parts[3],
          inboxIntro: parts[4],
        };
      }
    );
  }

  function parseHash() {
    var h = (location.hash || "#/").replace(/^#/, "");
    if (!h || h === "/") return { view: "map", node: "overview", cat: "books" };
    var parts = h.replace(/^\//, "").split("/");
    if (parts[0] === "system" && parts[1]) {
      var id = parts[1];
      if (NODES.some(function (n) { return n.id === id; })) {
        return { view: "map", node: id, cat: "books" };
      }
    }
    if (parts[0] === "sources") {
      var cat = parts[1] || "books";
      if (!SOURCE_FILES.some(function (c) { return c.id === cat; })) cat = "books";
      return { view: "sources", node: "overview", cat: cat };
    }
    if (parts[0] === "rules") return { view: "rules", node: "overview", cat: "books" };
    return { view: "map", node: "overview", cat: "books" };
  }

  function setNav(view) {
    document.querySelectorAll(".nav [data-nav]").forEach(function (a) {
      if (a.getAttribute("data-nav") === view) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  function tagHtml(kind, label) {
    return '<span class="tag ' + kind + '">' + escapeHtml(label) + "</span>";
  }

  function renderMap(state) {
    var questions = NODES.filter(function (n) {
      return n.question;
    })
      .map(function (n) {
        return (
          '<div class="q" data-for="' +
          n.id +
          '"><button type="button" data-go="' +
          n.id +
          '">' +
          escapeHtml(n.question) +
          "</button></div>"
        );
      })
      .join("");

    var nodes = NODES.filter(function (n) {
      return n.id !== "overview";
    })
      .map(function (n) {
        var page = DATA.pages[n.id];
        var tags = "";
        if (n.role === "official") tags += tagHtml("official-tag", "官方三问");
        else tags += tagHtml("editorial-tag", "本库整理");
        if (page && hasPublicQuotes(page)) tags += tagHtml("public", "有短引");
        else if (page && page.publicEmpty) tags += tagHtml("pending", "短引暂空");
        var on = state.node === n.id ? " is-on" : "";
        return (
          '<button type="button" class="node ' +
          n.role +
          on +
          '" id="n-' +
          n.id +
          '" data-go="' +
          n.id +
          '" aria-pressed="' +
          (state.node === n.id ? "true" : "false") +
          '">' +
          (n.num ? '<span class="num">' + n.num + "</span>" : "") +
          '<span class="title">' +
          escapeHtml(n.title) +
          "</span>" +
          (n.en ? '<span class="en">' + escapeHtml(n.en) + "</span>" : "") +
          '<span class="lead">' +
          escapeHtml(n.lead) +
          "</span>" +
          '<span class="tags">' +
          tags +
          "</span></button>"
        );
      })
      .join("");

    return (
      '<section class="hero">' +
      '<p class="hero-kicker">思想地图</p>' +
      " <h1>把可核对的出处和我们的整理分开看</h1>" +
      '<p class="hero-lead">中间三个节点对应官方对三本书的定位：卖什么、怎样让人知道、怎样从中赚钱。市场是从要约课里分出来的整理；交付和原则也是本库补上的篇目，不是与三本书并列的官方作品。</p>' +
      "</section>" +
      '<div class="map-wrap">' +
      '<svg class="map-links" id="map-links" aria-hidden="true"></svg>' +
      '<div class="map" id="map">' +
      questions +
      nodes +
      "</div></div>" +
      '<div class="legend">' +
      "<span><i class=\"official\"></i>官方三问对应的书</span>" +
      "<span><i class=\"editorial\"></i>本库整理分篇</span>" +
      "<span><i class=\"line\"></i>书与书之间的顺序</span>" +
      "<span><i class=\"dash\"></i>整理上的关系</span>" +
      "<span>" +
      tagHtml("public", "public") +
      " 可核对短引</span>" +
      "<span>" +
      tagHtml("synthesis", "synthesis") +
      " 我们的整理</span>" +
      "<span>" +
      tagHtml("pending", "待核对") +
      " 尚未对到第一手出处</span>" +
      "</div>"
    );
  }

  function renderQuotes(page) {
    if (page.publicEmpty && !page.quotes.length) {
      var empty = page.publicIntro || page.publicAfter || "这一层暂时留空，避免用整理冒充原文。";
      return '<div class="empty-public">' + renderBlocks(empty) + "</div>";
    }
    var qh = page.quotes
      .map(function (q) {
        return (
          '<figure class="quote">' +
          (q.topic ? '<p class="topic">' + escapeHtml(q.topic) + "</p>" : "") +
          "<blockquote>“" +
          escapeHtml(q.en) +
          "”</blockquote>" +
          (q.zh ? '<p class="zh">' + escapeHtml(q.zh) + "</p>" : "") +
          (q.source ? '<p class="src">' + inlineMd(q.source) + "</p>" : "") +
          "</figure>"
        );
      })
      .join("");
    var intro = page.publicIntro ? renderBlocks(page.publicIntro) : "";
    var after = page.publicAfter ? renderBlocks(page.publicAfter) : "";
    return intro + qh + after;
  }

  function renderDetail(state) {
    var node = NODES.filter(function (n) {
      return n.id === state.node;
    })[0] || NODES[0];
    var page = DATA.pages[node.id];
    if (!page) return "";
    var tags =
      tagHtml(page.source || "synthesis", page.source || "synthesis") +
      (page.status ? tagHtml("status", page.status) : "") +
      (node.role === "official" ? tagHtml("official-tag", "官方三问") : node.role === "editorial" ? tagHtml("editorial-tag", "本库整理分篇") : "") +
      (page.updated ? '<span class="updated">更新于 ' + escapeHtml(page.updated) + "（Asia/Shanghai）</span>" : "");

    var timeline =
      page.timeline && page.timeline.rows.length
        ? '<div class="timeline-wrap"><h2>概念时间</h2>' +
          (page.timelineNote ? renderBlocks(page.timelineNote) : "") +
          renderTable(page.timeline) +
          "</div>"
        : "";

    var mapSec =
      page["地图"]
        ? '<div class="timeline-wrap"><h2>地图上的六篇</h2>' + renderBlocks(page["地图"]) + "</div>"
        : "";
    var editSec =
      page["编辑说明"]
        ? '<div class="timeline-wrap"><h2>编辑说明</h2>' + renderBlocks(page["编辑说明"]) + "</div>"
        : "";

    return (
      '<article class="detail" id="detail">' +
      '<header class="detail-head"><div>' +
      "<h1>" +
      escapeHtml(page.title) +
      "</h1>" +
      '<div class="detail-meta">' +
      tags +
      "</div></div>" +
      '<div class="detail-actions">' +
      '<a class="btn-ghost" href="' +
      escapeHtml(BLOB + page.file) +
      '" rel="noopener noreferrer" target="_blank">查看源文件</a></div></header>' +
      (page.intro && node.id === "overview" ? '<div class="timeline-wrap">' + renderBlocks(page.intro) + "</div>" : "") +
      '<div class="layers">' +
      '<section class="layer public"><div class="layer-head"><h2>短引与出处</h2>' +
      tagHtml("public", "public") +
      "</div>" +
      renderQuotes(page) +
      "</section>" +
      '<section class="layer synthesis"><div class="layer-head"><h2>我们的整理</h2>' +
      tagHtml("synthesis", "synthesis") +
      "</div>" +
      renderBlocks(page.synthesis) +
      "</section></div>" +
      mapSec +
      timeline +
      editSec +
      "</article>"
    );
  }

  function bookYearCards() {
    var books = (DATA.sources.books && DATA.sources.books.table.rows) || [];
    return (
      '<div class="book-years">' +
      books
        .map(function (b) {
          var title = b["标题"] || "";
          var short = title.replace(/\*.*\*/, function (m) {
            return m;
          });
          var name = "";
          if (/\$100M Offers/.test(title)) name = "$100M Offers";
          else if (/\$100M Leads/.test(title)) name = "$100M Leads";
          else if (/\$100M Money Models/.test(title)) name = "$100M Money Models";
          else name = title.slice(0, 40);
          var hash = "#/sources/books";
          if (/Offers/.test(name)) hash = "#/system/offers";
          if (/Leads/.test(name)) hash = "#/system/leads";
          if (/Money/.test(name)) hash = "#/system/money";
          var zh = "";
          var zm = title.match(/暂译：([^）)]+)/);
          if (zm) zh = zm[1];
          return (
            '<a class="year-card" href="' +
            hash +
            '"><span class="yr">' +
            escapeHtml(b["日期"] || "") +
            '</span><span class="nm">' +
            escapeHtml(name) +
            "</span>" +
            (zh ? '<span class="sub">暂译：' + escapeHtml(zh) + "</span>" : "") +
            "</a>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function renderSourceCards(cat) {
    var tbl = cat.table;
    if (!tbl || !tbl.rows.length) return '<div class="empty-box"><p>这一类还没有条目。</p></div>';
    var cards = tbl.rows
      .map(function (row) {
        var fields = tbl.headers
          .filter(function (h) {
            return h !== "标题" && row[h];
          })
          .map(function (h) {
            return (
              "<dt>" +
              escapeHtml(h) +
              "</dt><dd>" +
              inlineMd(row[h]) +
              "</dd>"
            );
          })
          .join("");
        return (
          '<article class="card"><h3>' +
          inlineMd(row["标题"] || "") +
          '</h3><dl class="fields">' +
          fields +
          "</dl></article>"
        );
      })
      .join("");
    return '<div class="cards">' + cards + "</div>";
  }

  function renderSources(state) {
    var cat = DATA.sources[state.cat] || DATA.sources.books;
    var tabs = SOURCE_FILES.map(function (c) {
      var cur = c.id === state.cat ? ' aria-current="page"' : "";
      return (
        '<a href="#/sources/' +
        c.id +
        '"' +
        cur +
        ">" +
        escapeHtml(c.title) +
        "（" +
        ((DATA.sources[c.id] && DATA.sources[c.id].table.rows.length) || 0) +
        "）</a>"
      );
    }).join("");

    var notesEmpty =
      '<div class="empty-box"><p>第一手笔记（<code>notes/</code>）目前还是空的。有了按日期命名的笔记后，会在这里列出。</p></div>';

    return (
      '<section class="section-head">' +
      '<p class="hero-kicker">公开材料索引</p>' +
      "<h1>只登记元数据与链接，不放原文</h1>" +
      '<p class="hero-lead">出版日期若来自零售页或书目库，会在备注里写明，并与官方年份对照。查阅日期见各条备注（Asia/Shanghai）。</p>' +
      "</section>" +
      bookYearCards() +
      '<nav class="tabs" aria-label="材料类型">' +
      tabs +
      "</nav>" +
      (cat.intro ? '<div class="src-intro">' + renderBlocks(cat.intro) + "</div>" : "") +
      renderSourceCards(cat) +
      '<p style="margin-top:12px;font-size:13px;color:var(--muted)">源文件：<a href="' +
      escapeHtml(BLOB + cat.file) +
      '" rel="noopener noreferrer" target="_blank">' +
      escapeHtml(cat.file) +
      "</a></p>" +
      "<h2>笔记与待整理</h2>" +
      notesEmpty
    );
  }

  function renderRules() {
    var parsed = stripFrontmatter(DATA.rules);
    var body = parsed.body.replace(/^#\s+收录规则与编辑方法\s*/, "");
    return (
      '<section class="section-head"><p class="hero-kicker">编辑方法</p><h1>收录规则</h1></section>' +
      '<article class="detail" style="padding:8px 28px 28px">' +
      renderBlocks(body) +
      '<p><a class="btn-ghost" href="' +
      BLOB +
      'RULES.md" rel="noopener noreferrer" target="_blank">查看源文件</a></p>' +
      "</article>"
    );
  }

  function drawLinks() {
    var svg = document.getElementById("map-links");
    var map = document.getElementById("map");
    if (!svg || !map) return;
    if (window.matchMedia("(max-width: 880px)").matches) {
      svg.innerHTML = "";
      return;
    }
    var wr = map.parentElement.getBoundingClientRect();
    svg.setAttribute("viewBox", "0 0 " + wr.width + " " + wr.height);
    svg.setAttribute("width", wr.width);
    svg.setAttribute("height", wr.height);
    function center(id) {
      var el = document.getElementById("n-" + id);
      if (!el) return null;
      var r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2 - wr.left, y: r.top + r.height / 2 - wr.top, top: r.top - wr.top, bottom: r.bottom - wr.top, left: r.left - wr.left, right: r.right - wr.left };
    }
    var parts = [];
    LINKS.forEach(function (lk, idx) {
      var a = center(lk.from);
      var b = center(lk.to);
      if (!a || !b) return;
      var x1, y1, x2, y2;
      if (lk.from === "market" && lk.to === "offers") {
        x1 = a.right;
        y1 = (a.top + a.bottom) / 2;
        x2 = b.left;
        y2 = (b.top + b.bottom) / 2;
      } else if (lk.to === "delivery") {
        x1 = (a.left + a.right) / 2;
        y1 = a.bottom;
        x2 = x1;
        y2 = b.top;
      } else {
        x1 = a.right;
        y1 = (a.top + a.bottom) / 2;
        x2 = b.left;
        y2 = (b.top + b.bottom) / 2;
      }
      var cls = lk.style === "dash" ? "dash" : "";
      var d;
      if (lk.to === "delivery") {
        d = "M" + x1 + " " + y1 + " L " + x2 + " " + y2;
      } else {
        var midX = (x1 + x2) / 2;
        d = "M" + x1 + " " + y1 + " C " + midX + " " + y1 + ", " + midX + " " + y2 + ", " + x2 + " " + y2;
      }
      parts.push('<path class="' + cls + '" d="' + d + '"/>');
    });
    svg.innerHTML = parts.join("");
  }

  function bindMapClicks(root) {
    root.querySelectorAll("[data-go]").forEach(function (el) {
      el.addEventListener("click", function () {
        location.hash = "#/system/" + el.getAttribute("data-go");
      });
    });
  }

  function render() {
    var state = parseHash();
    setNav(state.view);
    var app = document.getElementById("app");
    if (state.view === "sources") {
      app.innerHTML = renderSources(state);
    } else if (state.view === "rules") {
      app.innerHTML = renderRules();
    } else {
      app.innerHTML = renderMap(state) + renderDetail(state);
      bindMapClicks(app);
      requestAnimationFrame(function () {
        drawLinks();
        if (state.node && state.node !== "overview") {
          var d = document.getElementById("detail");
          if (d && location.hash.indexOf("/system/") !== -1 && !render._first) {
            d.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
        render._first = false;
      });
    }
  }
  render._first = true;

  function showError(err) {
    document.getElementById("loading").hidden = true;
    var el = document.getElementById("error");
    el.hidden = false;
    el.innerHTML =
      "无法载入仓库正文。" +
      escapeHtml(err && err.message ? err.message : String(err)) +
      ' 请直接在 <a href="' +
      REPO +
      '" rel="noopener noreferrer" target="_blank">GitHub 仓库</a> 阅读 Markdown。';
  }

  function init() {
    loadAll()
      .then(function (data) {
        DATA = data;
        document.getElementById("loading").hidden = true;
        document.getElementById("app").hidden = false;
        render();
        window.addEventListener("hashchange", render);
        window.addEventListener("resize", drawLinks);
      })
      .catch(showError);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
