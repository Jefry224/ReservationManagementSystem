export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  db: {
    ssl: process.env.DB_SSL === 'true',
  },
});
