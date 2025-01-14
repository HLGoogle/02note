document.getElementById('saveButton').onclick = async function() {
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
            loadNotes(); // 添加这行来刷新笔记列表
        } else {
            alert('保存失败！');
        }
    } catch (error) {
        console.error('保存失败:', error);
        alert('保存失败！');
    }
};

// 添加加载笔记的函数
async function loadNotes() {
    try {
        const response = await fetch('/api/notes');
        const data = await response.json();
        
        const notesList = document.getElementById('notesList');
        notesList.innerHTML = '';
        
        data.results.forEach(note => {
            const noteDiv = document.createElement('div');
            noteDiv.className = 'note';
            noteDiv.textContent = note.content;
            notesList.appendChild(noteDiv);
        });
    } catch (error) {
        console.error('加载笔记失败:', error);
    }
}

// 页面加载时获取笔记
window.onload = loadNotes;
