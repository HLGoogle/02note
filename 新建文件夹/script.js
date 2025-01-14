document.getElementById('saveButton').onclick = async function() {
    const content = document.getElementById('content').value;

    const response = await fetch('YOUR_CLOUDFLARE_D1_API_ENDPOINT', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_API_TOKEN'
        },
        body: JSON.stringify({ content })
    });

    if (response.ok) {
        alert('内容已保存！');
    } else {
        alert('保存失败！');
    }
};