module.exports = `select * from webhooks
where id > 
( (select COUNT(*) from webhooks) - 100)
`;
