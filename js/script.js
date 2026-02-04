/**
 * 02note 核心交互逻辑 (右下角布局修正版)
 */
document.addEventListener('DOMContentLoaded', function() {
    const contentArea = document.getElementById('content');
    const saveBtn = document.getElementById('saveButton');
    const pinCheckbox = document.getElementById('pinCheckbox');
    const notesList = document.getElementById('notesList');

    // 1. 加载笔记列表
    async function loadNotes() {
        try {
            const response = await fetch('/api/notes');
            if (!response.ok) throw new Error('读取数据失败');
            
            const data = await response.json();
            notesList.innerHTML = '';
            
            if (!data || data.length === 0) {
                notesList.innerHTML = '<p style="color:#a0aec0;text-align:center;padding:40px;">暂无笔记，记录第一条吧 ✨</p>';
                return;
            }

            data.forEach((note, index) => {
                const noteDiv = document.createElement('div');
                noteDiv.className = 'note' + (note.is_pinned ? ' pinned' : '');
                
                // 右上角编号
                const numberSpan = document.createElement('span');
                numberSpan.className = 'note-number';
                numberSpan.textContent = note.is_pinned ? 'PINNED' : `#${data.length - index}`;
                
                // 内容区
                const contentDiv = document.createElement('div');
                contentDiv.className = 'note-content';
                contentDiv.textContent = note.content;
                
                // 右下角操作容器
                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'actions';

                // --- 置顶切换 ---
                const pinLabel = document.createElement('label');
                pinLabel.className = 'pin-toggle-label';
                const pinInput = document.createElement('input');
                pinInput.type = 'checkbox';
                pinInput.checked = !!note.is_pinned;
                pinInput.onchange = () => handleTogglePin(note.id, !note.is_pinned, note.content);
                pinLabel.appendChild(pinInput);
                pinLabel.append(' 置顶');

                // --- 修改按钮 ---
                const editBtn = document.createElement('button');
                editBtn.className = 'btn-small edit-btn';
                editBtn.textContent = '修改';
                editBtn.onclick = () => handleEdit(note.id, note.content, note.is_pinned);

                // --- 删除按钮 ---
                const delBtn = document.createElement('button');
                delBtn.className = 'btn-small delete-btn';
                delBtn.textContent = '删除';
                delBtn.onclick = () => handleDelete(note.id);
                
                // 将所有按钮按顺序放入右下角容器
                actionsDiv.appendChild(pinLabel);
                actionsDiv.appendChild(editBtn);
                actionsDiv.appendChild(delBtn);
                
                // 组装笔记卡片
                noteDiv.appendChild(numberSpan);
                noteDiv.appendChild(contentDiv);
                noteDiv.appendChild(actionsDiv);
                
                notesList.appendChild(noteDiv);
            });
        } catch (error) {
            console.error('Load Error:', error);
            notesList.innerHTML = '<p style="color:red;text-align:center;">无法连接到数据库，请检查网络或配置。</p>';
        }
    }

    // 2. 修改置顶状态
    async function handleTogglePin(id, newPinStatus, currentContent) {
        const password = prompt('请输入管理员密码以更改置顶状态:');
        if (password === null) {
            await loadNotes(); 
            return;
        }

        try {
            const response = await fetch('/api/notes', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    id, 
                    password, 
                    content: currentContent, 
                    is_pinned: newPinStatus ? 1 : 0 
                })
            });

            if (!response.ok) {
                const result = await response.json();
                alert('操作失败: ' + (result.error || '密码错误'));
            }
            await loadNotes();
        } catch (error) {
            alert('请求失败');
            await loadNotes();
        }
    }

    // 3. 修改内容逻辑
    async function handleEdit(id, oldContent, isPinned) {
        const password = prompt('请输入管理员密码以执行修改:');
        if (password === null) return;

        const newContent = prompt('请输入新的笔记内容:', oldContent);
        if (newContent === null || newContent.trim() === '') return;

        try {
            const response = await fetch('/api/notes', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    id, 
                    password, 
                    content: newContent,
                    is_pinned: isPinned
                })
            });

            const result = await response.json();
            if (response.ok) {
                await loadNotes();
            } else {
                alert('修改失败: ' + (result.error || '密码错误'));
            }
        } catch (error) {
            alert('修改请求失败，请稍后重试');
        }
    }

    // 4. 删除逻辑
    async function handleDelete(id) {
        const password = prompt('请输入管理员密码以执行删除:');
        if (password === null) return;

        try {
            const response = await fetch('/api/notes', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, password })
            });

            const result = await response.json();
            if (response.ok) {
                await loadNotes();
            } else {
                alert('操作失败: ' + (result.error || '密码错误'));
            }
        } catch (error) {
            alert('删除请求失败，请稍后重试');
        }
    }

    // 5. 保存逻辑
    saveBtn.addEventListener('click', async function() {
        const content = contentArea.value.trim();
        const isPinned = pinCheckbox.checked;
        if (!content) return;

        saveBtn.disabled = true;
        const originalText = saveBtn.textContent;
        saveBtn.textContent = '正在同步...';
        
        try {
            const response = await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, is_pinned: isPinned })
            });

            if (response.ok) {
                contentArea.value = '';
                pinCheckbox.checked = false;
                await loadNotes();
            } else {
                const err = await response.json();
                alert('保存失败: ' + (err.error || '数据库异常'));
            }
        } catch (error) {
            console.error('Save Error:', error);
            alert('连接服务器失败');
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = originalText;
        }
    });

    loadNotes();
});
