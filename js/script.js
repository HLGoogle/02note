/**
 * 02note 核心交互逻辑 (行内编辑版)
 */
document.addEventListener('DOMContentLoaded', function() {
    const contentArea = document.getElementById('content');
    const saveBtn = document.getElementById('saveButton');
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
                noteDiv.id = `note-${note.id}`;
                
                // 右上角编号
                const numberSpan = document.createElement('span');
                numberSpan.className = 'note-number';
                numberSpan.textContent = note.is_pinned ? '📌 PINNED' : `#${data.length - index}`;
                
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
                pinInput.onchange = () => handleQuickUpdate(note.id, note.content, pinInput.checked);
                pinLabel.appendChild(pinInput);
                pinLabel.append(' 置顶');

                // --- 修改按钮 (触发编辑模式) ---
                const editBtn = document.createElement('button');
                editBtn.className = 'btn-small edit-btn';
                editBtn.textContent = '修改';
                editBtn.onclick = () => enterEditMode(note, noteDiv, contentDiv, actionsDiv);

                // --- 删除按钮 ---
                const delBtn = document.createElement('button');
                delBtn.className = 'btn-small delete-btn';
                delBtn.textContent = '删除';
                delBtn.onclick = () => handleDelete(note.id);
                
                actionsDiv.appendChild(pinLabel);
                actionsDiv.appendChild(editBtn);
                actionsDiv.appendChild(delBtn);
                
                noteDiv.appendChild(numberSpan);
                noteDiv.appendChild(contentDiv);
                noteDiv.appendChild(actionsDiv);
                
                notesList.appendChild(noteDiv);
            });
        } catch (error) {
            console.error('Load Error:', error);
            notesList.innerHTML = '<p style="color:red;text-align:center;">无法连接到数据库。</p>';
        }
    }

    // 2. 进入编辑模式 (行内)
    function enterEditMode(note, noteDiv, contentDiv, actionsDiv) {
        const originalContent = note.content;
        
        // 1. 创建 TextArea 代替原内容
        const editArea = document.createElement('textarea');
        editArea.className = 'inline-edit-area';
        editArea.value = originalContent;
        // 自动聚焦并移动光标到末尾
        setTimeout(() => {
            editArea.focus();
            editArea.setSelectionRange(editArea.value.length, editArea.value.length);
        }, 10);

        // 2. 备份原有操作栏，创建编辑操作栏
        const originalActionsHTML = actionsDiv.innerHTML;
        actionsDiv.innerHTML = '';

        const saveEditBtn = document.createElement('button');
        saveEditBtn.className = 'btn-small save-edit-btn';
        saveEditBtn.textContent = '确认修改';
        
        const cancelEditBtn = document.createElement('button');
        cancelEditBtn.className = 'btn-small cancel-edit-btn';
        cancelEditBtn.textContent = '取消';

        // 3. 替换内容显示
        const oldDisplay = contentDiv.style.display;
        contentDiv.style.display = 'none';
        noteDiv.insertBefore(editArea, actionsDiv);

        // 保存逻辑
        saveEditBtn.onclick = async () => {
            const newText = editArea.value.trim();
            if (!newText) return;
            
            saveEditBtn.disabled = true;
            saveEditBtn.textContent = '保存中...';

            try {
                const response = await fetch('/api/notes', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        id: note.id, 
                        content: newText,
                        is_pinned: note.is_pinned 
                    })
                });

                if (response.ok) {
                    await loadNotes();
                } else {
                    alert('保存失败');
                    saveEditBtn.disabled = false;
                    saveEditBtn.textContent = '确认修改';
                }
            } catch (err) {
                alert('网络异常');
                saveEditBtn.disabled = false;
            }
        };

        // 取消逻辑
        cancelEditBtn.onclick = () => {
            noteDiv.removeChild(editArea);
            contentDiv.style.display = oldDisplay;
            actionsDiv.innerHTML = originalActionsHTML;
            // 重新绑定原始按钮事件 (通过 reload 简单处理，或直接重绑)
            loadNotes(); 
        };

        actionsDiv.appendChild(saveEditBtn);
        actionsDiv.appendChild(cancelEditBtn);
    }

    // 3. 快速更新 (置顶切换) - 无需密码
    async function handleQuickUpdate(id, content, isPinned) {
        try {
            const response = await fetch('/api/notes', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, content, is_pinned: isPinned ? 1 : 0 })
            });
            if (!response.ok) await loadNotes();
            else await loadNotes(); // 刷新布局顺序
        } catch (error) {
            await loadNotes();
        }
    }

    // 4. 删除逻辑 (仍保留管理员密码)
    async function handleDelete(id) {
        const password = prompt('请输入管理员密码以执行删除:');
        if (password === null) return;

        try {
            const response = await fetch('/api/notes', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, password })
            });

            if (response.ok) {
                await loadNotes();
            } else {
                const result = await response.json();
                alert('操作失败: ' + (result.error || '密码错误'));
            }
        } catch (error) {
            alert('请求异常');
        }
    }

    // 5. 保存逻辑 (直接保存)
    saveBtn.addEventListener('click', async function() {
        const content = contentArea.value.trim();
        if (!content) return;

        saveBtn.disabled = true;
        saveBtn.textContent = '同步中...';
        
        try {
            const response = await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, is_pinned: 0 })
            });

            if (response.ok) {
                contentArea.value = '';
                await loadNotes();
            }
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = '保存到云端';
        }
    });

    loadNotes();
});
