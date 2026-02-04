/**
 * 02note 核心交互逻辑 (增强版)
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
                noteDiv.className = 'note clearfix' + (note.is_pinned ? ' pinned' : '');
                
                const numberSpan = document.createElement('span');
                numberSpan.className = 'note-number';
                numberSpan.textContent = note.is_pinned ? '📌 置顶' : `#${data.length - index}`;
                
                const contentDiv = document.createElement('div');
                contentDiv.className = 'note-content';
                contentDiv.textContent = note.content;
                
                // 操作按钮容器
                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'actions';

                // 修改按钮
                const editBtn = document.createElement('button');
                editBtn.className = 'btn-small edit-btn';
                editBtn.textContent = '修改';
                editBtn.onclick = () => handleEdit(note.id, note.content);

                // 删除按钮
                const delBtn = document.createElement('button');
                delBtn.className = 'btn-small delete-btn';
                delBtn.textContent = '删除';
                delBtn.onclick = () => handleDelete(note.id);
                
                actionsDiv.appendChild(editBtn);
                actionsDiv.appendChild(delBtn);
                
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

    // 2. 修改逻辑 (带密码验证)
    async function handleEdit(id, oldContent) {
        const password = prompt('请输入管理员密码以执行修改:');
        if (password === null) return;

        const newContent = prompt('请输入新的笔记内容:', oldContent);
        if (newContent === null || newContent.trim() === '') return;

        try {
            const response = await fetch('/api/notes', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, password, content: newContent })
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

    // 3. 删除逻辑 (带密码验证)
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

    // 4. 保存逻辑
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
                pinCheckbox.checked = false; // 重置置顶勾选
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

    // 初始化加载
    loadNotes();
});
