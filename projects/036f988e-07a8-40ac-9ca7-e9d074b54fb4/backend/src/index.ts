// Main server entry
import app from './app';
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`RCM Claim Import server running on port ${PORT}`);
});