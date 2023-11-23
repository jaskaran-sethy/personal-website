import fs from 'fs';
import path from 'path';

const postsDirectory = path.join(process.cwd(), 'posts');

export function getSortedPostsData() {
    return null;
}

export function getAllPostIds() {
    const fileNames = fs.readdirSync(postsDirectory);

    /*
    Returns an array that looks like this:
    [
      {
        params: {
          id: 'ssg-ssr'
        }
      },
      {
        params: {
          id: 'pre-rendering'
        }
      }
    ]
    */
    return fileNames.map((fileName) => {
        return {
            params: {
                id: fileName.replace(/\.md$/, ''),
            },
        };
    });
}

export async function getPostData(id) {
    const fullPath = path.join(postsDirectory, `${id}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
}