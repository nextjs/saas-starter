import { createUploadConfig } from 'pushduck/server';
import { getUser } from '@/lib/db/queries';

const { s3 } = createUploadConfig()
  .provider('aws', {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    region: process.env.AWS_REGION!,
    bucket: process.env.AWS_S3_BUCKET!,
  })
  .build();

const router = s3.createRouter({
  profileImage: s3
    .image()
    .maxFileSize('4MB')
    .middleware(async () => {
      const user = await getUser();
      if (!user) {
        throw new Error('Unauthorized');
      }
      return { userId: String(user.id) };
    })
    .paths({
      generateKey: ({ file, metadata }) =>
        `users/${metadata.userId}/avatar/${file.name}`,
    }),

  document: s3
    .document()
    .maxFileSize('16MB')
    .middleware(async () => {
      const user = await getUser();
      if (!user) {
        throw new Error('Unauthorized');
      }
      return { userId: String(user.id) };
    })
    .paths({
      generateKey: ({ file, metadata }) =>
        `users/${metadata.userId}/documents/${Date.now()}-${file.name}`,
    }),
});

export type AppRouter = typeof router;

export const { GET, POST } = router.handlers;
