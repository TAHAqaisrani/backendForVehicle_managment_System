import db from '../config/db.js';

export const addRepairLog = async (req, res) => {
  try {
    const { job_card_id, status, notes } = req.body;
    if (!job_card_id || !status) return res.status(400).json({ error: 'job_card_id and status are required' });
    const [log] = await db('repair_logs')
      .insert({ job_card_id, updated_by: req.user.id, status, notes })
      .returning('*');
    await db('job_cards').where({ id: job_card_id }).update({ repair_status: status, updated_at: new Date() });
    res.status(201).json(log);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getRepairLogs = async (req, res) => {
  try {
    const logs = await db('repair_logs as rl')
      .join('users as u', 'u.id', 'rl.updated_by')
      .select('rl.*', 'u.name as updated_by_name', 'u.role as updated_by_role')
      .where('rl.job_card_id', req.params.jobCardId)
      .orderBy('rl.created_at', 'asc');
    res.json(logs);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
