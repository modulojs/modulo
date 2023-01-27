function initializedCallback() {
    state.chroot = '/srv/';
    state.allFiles = [
        {
            inode: 123,
            path: '/srv/app/index.html',
            name: 'index.html',
        },
        {
            inode: 3123,
            path: '/srv/app/',
            name: 'app/',
        },
        {
            inode: 2123,
            path: '/srv/modulo.json',
            name: 'modulo.json',
        },
        {
            inode: 223,
            path: '/srv/app/about.html',
            name: 'about.html',
        },
    ];
}

function getChildren(file, allFiles) {
    const children = [];
    for (const otherFile of allFiles){
        if (otherFile.path.startsWith(file.path)) {
            children.push(file);
        }
    }
    return children;
}

function prepareCallback() {
    // Apply "chroot" (filter files to only include children)
    state.files = [];
    for (const oldFile of state.allFiles) {
        if (!oldFile.path.startsWith(state.chroot)) {
            continue;
        }
        const path = oldFile.path.substr(state.chroot.length)
        const file = Object.assign({}, oldFile, { path });

        // Prep hints about files
        if (file.path.endsWith('/')) {
            file.hint = 'dir';
            file.expandedChildren = getChildren(file, state.allFiles);
        } else if (file.path.endsWith('.html')) {
            file.hint = 'doc';
        }

        // Has a parent
        file.parentPath = file.path.replace(file.name, '');

        state.files.push(file);
    }

    state.files.sort((a, b) => {
        if (a.path < b.path) {
            return -1;
        }
        if (a.path > b.path) {
            return 1;
        }
        return 0;
    });
}

