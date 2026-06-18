// ex 4.06 — consumer microservice. Subscribes to the "todos.created" subject on
// NATS and processes each event (here: logs it; could validate / notify).
const { connect, StringCodec } = require('nats');

const NATS_URL = process.env.NATS_URL || 'nats://nats:4222';
const SUBJECT = process.env.SUBJECT || 'todos.created';
const sc = StringCodec();

(async () => {
  const nc = await connect({ servers: NATS_URL });
  console.log(`broadcaster connected to ${NATS_URL}, listening on "${SUBJECT}"`);
  const sub = nc.subscribe(SUBJECT);
  for await (const m of sub) {
    console.log(`event: a todo was created -> ${sc.decode(m.data)}`);
  }
})().catch((e) => { console.error(e); process.exit(1); });
