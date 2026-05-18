import os

path = 'src/app/features/admin/admin-dashboard/admin-dashboard.component.ts'
with open(path, 'r') as f:
    content = f.read()

# Replace href with routerLink where appropriate
content = content.replace('href="/admin/content"', 'routerLink="/admin/content-management"')
content = content.replace('href="/admin/content-review"', 'routerLink="/admin/content-review"')
content = content.replace('href="/admin/alumni"', 'routerLink="/admin/alumni"')
content = content.replace('href="/admin/forums"', 'routerLink="/admin/forums"')
content = content.replace('href="#"', 'routerLink="."')

with open(path, 'w') as f:
    f.write(content)
