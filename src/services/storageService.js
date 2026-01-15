const fs = require('fs');
const path = require('path');

class StorageService {
  async uploadFile(filename, filepath, mimetype) {
    // Here we use local storage as example
    const storagePath = path.join(__dirname, '../../storage/certificates', filename);
    fs.copyFileSync(filepath, storagePath);
    return { url: `${process.env.BASE_URL}/storage/certificates/${filename}` };
  }

  async deleteFile(filename) {
    const filepath = path.join(__dirname, '../../storage/certificates', filename);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
  }
}

module.exports = new StorageService();
