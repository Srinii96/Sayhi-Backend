const AWS = require("aws-sdk")

// Configure the AWS SDK with your credentials
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_BUCKET_REGION,
  endpoint: 's3.ap-south-1.amazonaws.com'
})

async function uploadToS3(file, userId) {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${userId}/${file.fieldname}/${Number(new Date())}-${file.originalname}`,
    Body: file.buffer,
  }

  try {
    const data = await s3.upload(params).promise()
    return { url: data.Location, key: data.Key }
  } catch (err) {
    console.error('Error uploading to S3:', err)
    throw err
  }
}

module.exports = uploadToS3
