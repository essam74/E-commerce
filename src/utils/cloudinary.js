import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

import * as dotenv from 'dotenv'
dotenv.config({ path: path.join(__dirname, '../../config/.env')})

import cloudinary from 'cloudinary';


cloudinary.v2.config({ 
    api_key:"747343858392974",
    api_secret:"Rn_SsGCiAJD9rqtD5vqbMvWRvKs",
    cloud_name:"dez4sa2ov",
    secure: true
})

export default cloudinary.v2;