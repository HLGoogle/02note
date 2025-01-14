// 等待 DOM 加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 获取按钮并添加点击事件
    document.getElementById('saveButton').addEventListener('click', async function() {
        const content = document.getElementById('content').value;
        
        try {
            const response = await fetch('/api/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content })
            });

            if (response.ok) {
                alert('内容已保存！');
                document.getElementById('content').value = '';
                loadNotes();
            } else {
                alert('保存失败！');
            }
        } catch (error) {
            console.error('保存失败:', error);
            alert('保存失败！');
        }
    });
});

async function loadNotes() {
    try {
        const response = await fetch('/api/notes');
        const data = await response.json();
        
        const notesList = document.getElementById('notesList');
        notesList.innerHTML = '';
        
        data.results.forEach((note, index) => {
            const noteDiv = document.createElement('div');
            noteDiv.className = 'note';
            
            // 添加计数
            const numberSpan = document.createElement('span');
            numberSpan.className = 'note-number';
            numberSpan.textContent = (index + 1).toString();
            
            // 创建内容元素
            const contentDiv = document.createElement('div');
            contentDiv.textContent = note.content;
            
            // 添加内容和计数标签
            noteDiv.appendChild(contentDiv);
            noteDiv.appendChild(numberSpan);
            
            notesList.appendChild(noteDiv);
        });
    } catch (error) {
        console.error('加载笔记失败:', error);
    }
}

// 页面加载时获取笔记
window.onload = loadNotes;
