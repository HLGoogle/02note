/**
 * 优化说明：
 * 1. 统一使用 DOMContentLoaded 生命周期。
 * 2. 增加保存时的按钮禁用状态，防止重复提交。
 * 3. 简化渲染逻辑，保持与后端返回的数组结构一致。
 */
document.addEventListener('DOMContentLoaded', function() {
    const contentArea = document.getElementById('content');
    const saveBtn = document.getElementById('saveButton');
    const notesList = document.getElementById('notesList');

    // 加载笔记列表
    async function loadNotes() {
        try {
            const response = await fetch('/api/notes');
            if (!response.ok) throw new Error('网络请求失败');
            
            const data = await response.json(); // 后端已优化为直接返回数组
            
            // 清空现有列表
            notesList.innerHTML = '';
            
            // 遍历渲染
            data.forEach((note, index) => {
                const noteDiv = document.createElement('div');
                noteDiv.className = 'note';
                
                // 编号逻辑：总数 - 当前索引，确保最新的一条编号最大
                const numberSpan = document.createElement('span');
                numberSpan.className = 'note-number';
                numberSpan.textContent = `#${data.length - index}`;
                
                const contentDiv = document.createElement('div');
                contentDiv.textContent = note.content; // 使用 textContent 确保安全
                
                noteDiv.appendChild(contentDiv);
                noteDiv.appendChild(numberSpan);
                notesList.appendChild(noteDiv);
            });
        } catch (error) {
            console.error('加载笔记失败:', error);
        }
    }

    // 保存笔记
    saveBtn.addEventListener('click', async function() {
        const content = contentArea.value.trim();
        if (!content) return;

        // 状态保护：禁用按钮防止网络卡顿时重复提交
        saveBtn.disabled = true;
        const originalText = saveBtn.textContent;
        saveBtn.textContent = '保存中...';
        
        try {
            const response = await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            });

            if (response.ok) {
                contentArea.value = '';
                await loadNotes(); // 重新加载列表
            } else {
                const err = await response.json();
                alert('保存失败: ' + (err.error || '未知错误'));
            }
        } catch (error) {
            console.error('请求出错:', error);
            alert('服务器连接失败，请稍后重试');
        } finally {
            // 恢复按钮状态
            saveBtn.disabled = false;
            saveBtn.textContent = originalText;
        }
    });

    // 首次进入页面加载列表
    loadNotes();
});
