async function checkAuth() {
    const { data: { session } } = await db.auth.getSession();
    if (!session) {
        window.location.href = '/Denis/login.html';
    }
    return session;
}

async function loadPlaces() {
    const grid = document.getElementById('placesGrid');
    if (!grid) return;

    const { data: places, error } = await db
        .from('places')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        grid.innerHTML = `<p class="error">Грешка при зареждане: ${error.message}</p>`;
        return;
    }

    if (places.length === 0) {
        grid.innerHTML = `<p>Все още няма добавени места.</p>`;
        return;
    }

    grid.innerHTML = places.map(p => `
        <div class="place-card">
            <img src="${p.image_url || 'https://via.placeholder.com/400x200'}" class="card-img">
            <div class="card-info">
                <span class="card-tag">${p.category}</span>
                <h3>${p.title}</h3>
                <p>${p.description}</p>
            </div>
        </div>
    `).join('');
}

const placeForm = document.getElementById('placeForm');
if (placeForm) {
    placeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('saveBtn');
        const msg = document.getElementById('statusMsg');

        const title = document.getElementById('pTitle').value;
        const category = document.getElementById('pCategory').value;
        const image_url = document.getElementById('pImg').value;
        const description = document.getElementById('pDesc').value;

        btn.disabled = true;
        btn.textContent = 'Публикуване...';

        const { error } = await db.from('places').insert([
            { title, category, image_url, description }
        ]);

        if (error) {
            msg.textContent = "Грешка: " + error.message;
            msg.className = "msg error";
            btn.disabled = false;
        } else {
            msg.textContent = "Успешно добавено!";
            msg.className = "msg success";
            setTimeout(() => window.location.href = 'index.html', 1500);
        }
    });
}

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        await db.auth.signOut();
        window.location.href = '/Denis/login.html';
    });
}

checkAuth().then(() => {
    loadPlaces();
});
