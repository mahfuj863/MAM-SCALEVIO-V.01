const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, 'content', 'blog');
const outputFile = path.join(__dirname, 'blog.json');

function parseMarkdown(content) {
    const lines = content.split('\n');
    let inFrontmatter = false;
    let frontmatter = {};
    let body = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim() === '---') {
            if (inFrontmatter) {
                inFrontmatter = false;
                continue;
            } else if (i === 0) {
                inFrontmatter = true;
                continue;
            }
        }

        if (inFrontmatter) {
            const colonIndex = line.indexOf(':');
            if (colonIndex > -1) {
                const key = line.substring(0, colonIndex).trim();
                let value = line.substring(colonIndex + 1).trim();
                // Remove surrounding quotes if they exist
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.substring(1, value.length - 1);
                } else if (value.startsWith("'") && value.endsWith("'")) {
                    value = value.substring(1, value.length - 1);
                }
                frontmatter[key] = value;
            }
        } else {
            body.push(line);
        }
    }

    return { data: frontmatter, content: body.join('\n') };
}

function buildBlog() {
    if (!fs.existsSync(contentDir)) {
        console.log('Blog content directory does not exist.');
        fs.writeFileSync(outputFile, JSON.stringify([]));
        return;
    }

    const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'));
    const posts = [];

    files.forEach((file, index) => {
        const fileContent = fs.readFileSync(path.join(contentDir, file), 'utf-8');
        const parsed = parseMarkdown(fileContent);
        
        // Extract the title, category, etc. from data
        const post = {
            id: index + 1,
            title: parsed.data.title || 'Untitled',
            excerpt: parsed.data.excerpt || '',
            category: parsed.data.category || 'all',
            image: parsed.data.image || '',
            date: parsed.data.date || new Date().toISOString().split('T')[0],
            readTime: parsed.data.readTime || '5 min read',
            body: parsed.content
        };
        posts.push(post);
    });

    fs.writeFileSync(outputFile, JSON.stringify(posts, null, 2));
    console.log(`Successfully built blog.json with ${posts.length} posts.`);
}

buildBlog();
