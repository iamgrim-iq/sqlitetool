const clige   = require('./clige');
const sqlite3 = require('sqlite3').verbose();
const fs      = require('fs');
const path    = require('path');

const bannerArt = `
  ██████   █████   ██▓     ██▓▄▄▄█████▓▓█████    ▄▄▄█████▓ ▒█████   ▒█████   ██▓    
▒██    ▒ ▒██▓  ██▒▓██▒    ▓██▒▓  ██▒ ▓▒▓█   ▀    ▓  ██▒ ▓▒▒██▒  ██▒▒██▒  ██▒▓██▒    
░ ▓██▄   ▒██▒  ██░▒██░    ▒██▒▒ ▓██░ ▒░▒███      ▒ ▓██░ ▒░▒██░  ██▒▒██░  ██▒▒██░    
  ▒   ██▒░██  █▀ ░▒██░    ░██░░ ▓██▓ ░ ▒▓█  ▄    ░ ▓██▓ ░ ▒██   ██░▒██   ██░▒██░    
▒██████▒▒░▒███▒█▄ ░██████▒░██░  ▒██▒ ░ ░▒████▒     ▒██▒ ░ ░ ████▓▒░░ ████▓▒░░██████▒
▒ ▒▓▒ ▒ ░░░ ▒▒░ ▒ ░ ▒░▓  ░░▓    ▒ ░░   ░░ ▒░ ░     ▒ ░░   ░ ▒░▒░▒░ ░ ▒░▒░▒░ ░ ▒░▓  ░
░ ░▒  ░ ░ ░ ▒░  ░ ░ ░ ▒  ░ ▒ ░    ░     ░ ░  ░       ░      ░ ▒ ▒░   ░ ▒ ▒░ ░ ░ ▒  ░
░  ░  ░     ░   ░   ░ ░    ▒ ░  ░         ░        ░      ░ ░ ░ ▒  ░ ░ ░ ▒    ░ ░   
      ░      ░        ░  ░ ░              ░  ░                ░ ░      ░ ░      ░  ░    
`;

class SQLiteTool {
    constructor() {
        this.db      = null;
        this.dbPath  = null;
        this.theme   = clige.getTheme('redblood');
        this.running = false;
    }

    banner(status = '') {
        const art = bannerArt
            .trimEnd()
            .split('\n')
            .map(l => this.theme.colorize(l, 'colors.blood'))
            .join('\n');

        const info = status
            ? '\n' + this.theme.colorize(status, 'styles.subtitle')
            : '';

        return art + info + '\n';
    }

    async start() {
        this.running = true;

        while (this.running) {
            try {
                await this.mainMenu();
            } catch (e) {
                console.log(this.theme.colorize(`\nОШИБКА: ${e.message}`, 'messages.error.color'));
                await clige.waitForEnter('\nEnter...');
            }
        }

        if (this.db) this.db.close();
    }

    async mainMenu() {
        const items = [
            { text: 'Открыть базу',         value: 'open'   },
            { text: 'Создать базу',         value: 'create' }
        ];

        if (this.db) {
            items.push(
                { text: 'Просмотр таблиц',   value: 'tables' },
                { text: 'SQL-запрос',        value: 'query'  },
                { text: 'Структура таблицы', value: 'struct' },
                { text: 'Закрыть базу',      value: 'close'  }
            );
        }

        items.push({ text: 'Выход', value: 'exit' });

        const status = this.db
            ? `Открыта: ${path.basename(this.dbPath)}`
            : 'База не выбрана';

        const sel = await clige.createInteractiveMenu(
            items,
            {
                center: true,
                boxOptions: {
                    borderStyle: 'double',
                    color: this.theme.get('colors.blood')
                }
            },
            this.banner(status)
        );

        if (!sel) return;

        if (sel.value === 'open')   await this.openDB();
        if (sel.value === 'create') await this.createDB();
        if (sel.value === 'tables') await this.tablesMenu();
        if (sel.value === 'query')  await this.freeQuery();
        if (sel.value === 'struct') await this.structMenu();
        if (sel.value === 'close')  this.closeDB();
        if (sel.value === 'exit')   { clige.clear(); process.exit(0); }
    }

    async openDB() {
        const p = await clige.readLine('Путь к *.db: ', { validator: fs.existsSync });
        if (this.db) this.db.close();
        this.db     = new sqlite3.Database(p);
        this.dbPath = p;
    }

    async createDB() {
        const p   = await clige.readLine('Имя новой базы: ');
        const dir = path.dirname(p);

        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        if (this.db) this.db.close();
        this.db     = new sqlite3.Database(p);
        this.dbPath = p;
    }

    async listTables() {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`,
                (e, rows) => {
                    if (e) return reject(e);
                    resolve(rows.map(r => r.name));
                }
            );
        });
    }

    async tablesMenu() {
        const tables = await this.listTables();

        if (!tables.length) {
            console.log('Нет таблиц.');
            await clige.waitForEnter();
            return;
        }

        const sel = await clige.createInteractiveMenu(
            tables.map(t => ({ text: t, value: t })),
            { center: true }
        );

        if (sel) await this.showRows(sel.value);
    }

    async showRows(table, limit = 20) {
        limit = await clige.readNumber(`Строк (${limit}): `, {
            defaultValue: limit,
            min: 1,
            max: 1000
        });

        const sql = `SELECT * FROM "${table}" LIMIT ${limit}`;
        const t0  = Date.now();

        this.db.all(sql, (e, rows) => {
            if (e) { console.log(e.message); return; }
            this.printRows(rows, Date.now() - t0);
        });

        await clige.waitForEnter('\nEnter...');
    }

    async freeQuery() {
        const q = await clige.readMultiline('SQL (END):\n', { endMarker: 'END' });
        if (!q.trim()) return;
        await this.runQuery(q);
    }

    async structMenu() {
        const tables = await this.listTables();

        if (!tables.length) {
            console.log('Нет таблиц.');
            await clige.waitForEnter();
            return;
        }

        const sel = await clige.createInteractiveMenu(
            tables.map(t => ({ text: t, value: t })),
            { center: true }
        );

        if (sel) await this.showStruct(sel.value);
    }

    async showStruct(table) {
        clige.clear();

        this.db.all(`PRAGMA table_info("${table}")`, (e, rows) => {
            if (e) { console.log(e.message); return; }

            console.log(this.theme.colorize(`СТРУКТУРА: ${table}`, 'styles.title'));
            console.log(this.theme.get('colors.blood') + '─'.repeat(70) + clige.COLORS.RESET);

            rows.forEach(col => {
                const parts = [
                    this.theme.colorize(col.name, 'colors.crimson'),
                    '(' + this.theme.colorize(col.type, 'colors.fire') + ')',
                    col.notnull
                        ? this.theme.colorize('NOT NULL', 'colors.blood')
                        : this.theme.colorize('NULL', 'styles.shadow'),
                    col.pk ? this.theme.colorize('[PK]', 'colors.fire') : '',
                    col.dflt_value
                        ? this.theme.colorize(`DEFAULT ${col.dflt_value}`, 'colors.crimson')
                        : ''
                ].filter(Boolean).join(' ');

                console.log(parts);
            });

            console.log(this.theme.get('colors.blood') + '─'.repeat(70) + clige.COLORS.RESET);
        });

        await clige.waitForEnter('\nEnter...');
    }

    async runQuery(q) {
        const isSelect = q.trim().toLowerCase().startsWith('select');
        const t0       = Date.now();

        if (isSelect) {
            this.db.all(q, (e, rows) => {
                if (e) { console.log(e.message); return; }
                this.printRows(rows, Date.now() - t0);
            });
        } else {
            this.db.run(q, function (e) {
                if (e) { console.log(e.message); return; }
                console.log(`Изменено: ${this.changes}  (${Date.now() - t0} мс)`);
            });
        }

        await clige.waitForEnter('\nEnter...');
    }

    printRows(rows, ms) {
        if (!rows.length) { console.log('Пусто.'); return; }

        const headers = Object.keys(rows[0]);
        const data    = [
            headers,
            ...rows.map(r => headers.map(k => String(r[k])))
        ];

        let table = clige.createTable(data, {
            showHeaders: true,
            showBorders: true
        });

        const { width } = clige.getTerminalSize();
        table = clige.centerText(table, { width });

        clige.clear();
        console.log('\n' + table + '\n');
        console.log(this.theme.colorize(`Строк: ${rows.length}  Время: ${ms} мс`, 'styles.subtitle'));
    }

    closeDB() {
        if (this.db) {
            this.db.close();
            this.db     = null;
            this.dbPath = null;
        }
    }
}

if (require.main === module) {
    new SQLiteTool().start();
}

module.exports = SQLiteTool;
