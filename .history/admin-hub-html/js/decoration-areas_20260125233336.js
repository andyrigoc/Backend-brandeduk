/**
 * Products Settings - Decoration Areas
 * DecoNetwork-style group list + per-group popup editor.
 */

const DECORATION_AREAS_STORAGE_KEY = 'adminHub.decorationAreas';

const DEFAULT_DECORATION_STATE = {
    scaleOnDimensionChange: true,
    groups: {
        adult_tops: {
            enabled: true,
            name: 'Adult Tops',
            icon: 'fa-shirt',
            areas: [
                area(1537, 'Body', 30.48, 40.64, allProc()),
                area(3642, 'Back', 30.48, 40.64, allProc()),
                area(1127, 'Left Sleeve (Short)', 5.08, 5.08, allProc()),
                area(1127, 'Right Sleeve (Short)', 5.08, 5.08, allProc()),
                area(1908, 'Left Sleeve (Long)', 5.08, 15.24, allProc()),
                area(1928, 'Right Sleeve (Long)', 5.08, 15.24, allProc()),
                area(721, 'Collar: Back', 10.16, 5.08, allProc()),
                area(696, 'Split Body Top', 30.48, 20.32, allProc()),
                area(86, 'Split Body Bottom', 30.48, 20.32, allProc())
            ]
        },
        youth_tops: {
            enabled: true,
            name: 'Youth Tops',
            icon: 'fa-shirt',
            areas: [
                area(312, 'Youth Right Chest', 7.62, 7.62, proc({ emb: true })),
                area(296, 'Youth Back', 22.86, 30.48, allProc()),
                area(315, 'Youth Left Chest', 7.62, 7.62, proc({ emb: true })),
                area(154, 'Youth Body', 22.86, 30.48, allProc()),
                area(71, 'Youth Split Body Top', 22.86, 15.24, allProc()),
                area(7, 'Youth Split Body Bottom', 22.86, 15.24, allProc()),
                area(143, 'Youth Left Sleeve (Long)', 5.08, 15.24, allProc()),
                area(147, 'Youth Right Sleeve (Long)', 5.08, 15.24, allProc())
            ]
        },
        infants: {
            enabled: true,
            name: 'Infants',
            icon: 'fa-baby',
            areas: [
                area(71, 'Infant Back', 15.24, 20.32, proc({ dtg: true, emb: false, scr: true, htv: true, dtf: true })),
                area(55, 'Infant Body', 15.24, 20.32, proc({ dtg: true, emb: false, scr: true, htv: true, dtf: true })),
                area(19, 'Infant Split Body Top', 15.24, 10.16, proc({ dtg: true, emb: false, scr: true, htv: true, dtf: true })),
                area(7, 'Infant Split Body Bottom', 15.24, 10.16, proc({ dtg: true, emb: false, scr: true, htv: true, dtf: true })),
                area(86, 'Infant Left Chest', 5.08, 5.08, proc({ dtg: false, emb: true, scr: false, htv: false, dtf: false })),
                area(17, 'Infant Left Sleeve (Short)', 2.54, 2.54, proc({ dtg: false, emb: true, scr: false, htv: false, dtf: false })),
                area(17, 'Infant Right Sleeve (Short)', 2.54, 2.54, proc({ dtg: false, emb: true, scr: false, htv: false, dtf: false }))
            ]
        },
        pants: {
            enabled: true,
            name: 'Pants',
            icon: 'fa-person-walking',
            areas: [
                area(1, 'Crotch', 5.08, 5.08, allProc()),
                area(2, 'Bottom', 20.32, 10.16, allProc()),
                area(220, 'Left Leg (Short)', null, null, allProc()),
                area(221, 'Right Leg (Short)', null, null, allProc()),
                area(553, 'Left Leg (Long)', null, null, allProc()),
                area(551, 'Right Leg (Long)', null, null, allProc())
            ]
        },
        headwear: {
            enabled: true,
            name: 'Headwear',
            icon: 'fa-hat-cowboy',
            areas: [
                area(856, 'Headwear Front', 12.7, 5.71, allProc()),
                area(449, 'Headwear Left', 7.62, 5.08, proc({ dtg: false, emb: true, scr: false, htv: false, dtf: true })),
                area(448, 'Headwear Right', 7.62, 5.08, proc({ dtg: false, emb: true, scr: false, htv: false, dtf: true })),
                area(317, 'Headwear Arch Back', 8.89, 1.27, proc({ dtg: false, emb: true, scr: false, htv: false, dtf: true })),
                area(330, 'Headwear Back', 8.89, 5.08, proc({ dtg: false, emb: true, scr: false, htv: false, dtf: true })),
                area(52, 'Face Mask', null, null, proc({ dtg: false, emb: true, scr: false, htv: false, dtf: false }))
            ]
        },
        bags: {
            enabled: true,
            name: 'Bags',
            icon: 'fa-bag-shopping',
            areas: [
                area(1, 'Bag Front (Large)', 30.48, 30.48, allProc()),
                area(1, 'Bag Back (Large)', 30.48, 30.48, allProc()),
                area(1, 'Bag Front (Medium)', 20.32, 20.32, allProc()),
                area(1, 'Bag Back (Medium)', 20.32, 20.32, allProc()),
                area(5, 'Bag Front (Small)', 15.24, 15.24, allProc()),
                area(2, 'Bag Back (Small)', 15.24, 15.24, allProc()),
                area(806, 'Bag Front', null, null, allProc()),
                area(600, 'Bag Back', null, null, allProc())
            ]
        },
        towels: {
            enabled: true,
            name: 'Towels',
            icon: 'fa-border-all',
            areas: [
                area(25, 'Full Towel', 60.96, 121.92, proc({ dtg: false, emb: true, scr: false, htv: false, dtf: false })),
                area(25, 'Small Towel', 30.48, 40.64, proc({ dtg: true, emb: true, scr: true, htv: true, dtf: true })),
                area(0, 'Beach Towel Square', null, null, allProc()),
                area(11, 'Beach Towel Strip', null, null, allProc()),
                area(2, 'Hand Towel Square', null, null, allProc()),
                area(5, 'Hand Towel Strip', null, null, allProc()),
                area(1, 'Tea Towel', null, null, allProc())
            ]
        },
        aprons: {
            enabled: true,
            name: 'Aprons',
            icon: 'fa-person-apron',
            areas: [
                area(94, 'Apron Top Front', 15.24, 10.16, allProc()),
                area(63, 'Apron Bottom Front', 20.32, 20.32, allProc()),
                area(28, 'Apron Left Pocket', 10.16, 10.16, allProc()),
                area(51, 'Apron Middle Pocket', 15.24, 10.16, allProc()),
                area(29, 'Apron Right Pocket', 10.16, 10.16, allProc())
            ]
        }
    }
};

let decorationState = deepClone(DEFAULT_DECORATION_STATE);
let decorationSaved = deepClone(DEFAULT_DECORATION_STATE);
let currentEditGroupKey = null;

function initDecorationAreasPage() {
    loadDecorationAreasState();

    const container = document.getElementById('page-decoration-areas');
    if (!container) return;

    container.innerHTML = `
        <div class="page-header">
            <div class="breadcrumb">
                <a href="#">Dashboard</a> / Products / Decoration Areas
            </div>
            <h1 class="page-title">Decoration Areas</h1>
        </div>

        <div class="settings-page">
            <div class="settings-header">
                <div>
                    <h2 style="margin:0;">Manage Decoration Areas</h2>
                    <div class="settings-note">Select and configure your decoration areas. This may add or remove products if you have selected product catalogues.</div>
                </div>
                <div class="settings-row">
                    <label style="display:flex; align-items:center; gap:10px;">
                        <input type="checkbox" id="scaleDims" ${decorationState.scaleOnDimensionChange ? 'checked' : ''} />
                        <span class="settings-note">Scale decoration areas when changing physical dimensions</span>
                    </label>
                    <button class="btn btn-primary" id="saveDecorationBtn"><i class="fas fa-save"></i> Save</button>
                    <button class="btn btn-secondary" id="cancelDecorationBtn">Cancel</button>
                </div>
            </div>

            <div class="settings-body">
                <div class="card">
                    <div class="card-header">
                        <h3>Decoration Area Groups</h3>
                        <div class="settings-note">Click Edit to configure areas per group.</div>
                    </div>
                    <div class="card-body decoration-list">
                        <div class="table-wrap">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th class="checkbox-cell">&nbsp;</th>
                                        <th style="width:56px;">&nbsp;</th>
                                        <th style="width:220px;">Name</th>
                                        <th>Areas</th>
                                        <th class="actions">&nbsp;</th>
                                    </tr>
                                </thead>
                                <tbody id="decorationGroupsTbody"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id="decorationAreasModal" class="modal-overlay" aria-hidden="true"></div>
    `;

    container.querySelector('#scaleDims').addEventListener('change', (e) => {
        decorationState.scaleOnDimensionChange = !!e.target.checked;
    });

    container.querySelector('#saveDecorationBtn').addEventListener('click', () => {
        persistDecorationAreasState();
        decorationSaved = deepClone(decorationState);
        showToast('Decoration areas saved.', 'success');
    });

    container.querySelector('#cancelDecorationBtn').addEventListener('click', () => {
        decorationState = deepClone(decorationSaved);
        initDecorationAreasPage();
        showToast('Changes discarded.', 'info');
    });

    renderDecorationGroups();
}

function renderDecorationGroups() {
    const tbody = document.getElementById('decorationGroupsTbody');
    if (!tbody) return;

    const groupKeys = Object.keys(decorationState.groups);
    tbody.innerHTML = groupKeys.map(key => {
        const g = decorationState.groups[key];
        const areasText = (g.areas || []).slice(0, 8).map(a => a.name).join(', ');
        const more = (g.areas || []).length > 8 ? ` +${(g.areas || []).length - 8}` : '';

        return `
            <tr>
                <td class="checkbox-cell"><input type="checkbox" data-group-enable="${escapeHtml(key)}" ${g.enabled ? 'checked' : ''} /></td>
                <td class="icon-cell"><i class="fas ${escapeHtml(resolveIcon(g.icon))}"></i></td>
                <td><strong>${escapeHtml(g.name)}</strong></td>
                <td><div class="decoration-area-summary">${escapeHtml(areasText)}${escapeHtml(more)}</div></td>
                <td class="actions"><button class="btn btn-secondary" data-group-edit="${escapeHtml(key)}">Edit</button></td>
            </tr>
        `;
    }).join('');

    tbody.querySelectorAll('[data-group-enable]').forEach(cb => {
        cb.addEventListener('change', () => {
            const key = cb.getAttribute('data-group-enable');
            if (!key) return;
            decorationState.groups[key].enabled = !!cb.checked;
        });
    });

    tbody.querySelectorAll('[data-group-edit]').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.getAttribute('data-group-edit');
            if (!key) return;
            openDecorationGroupEditor(key);
        });
    });
}

function openDecorationGroupEditor(groupKey) {
    const overlay = document.getElementById('decorationAreasModal');
    if (!overlay) return;

    const group = decorationState.groups[groupKey];
    if (!group) return;

    currentEditGroupKey = groupKey;

    overlay.innerHTML = `
        <div class="modal-container modal-xl">
            <div class="modal-header">
                <h2><i class="fas fa-edit"></i> Edit Areas: ${escapeHtml(group.name)}</h2>
                <button class="modal-close" type="button" data-action="close"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <div class="editor-toolbar">
                    <p class="settings-note">Tick boxes to enable processes per area. Update Width/Height in cm.</p>
                    <button class="btn btn-secondary" type="button" data-action="add-area"><i class="fas fa-plus"></i> Add Area</button>
                </div>

                <div class="table-wrap">
                    <table class="table" id="areasEditorTable">
                        <thead>
                            <tr>
                                <th class="checkbox-cell">&nbsp;</th>
                                <th style="width:50px;">&nbsp;</th>
                                <th style="width:220px;">Name</th>
                                <th style="width:90px;">&nbsp;</th>
                                <th class="dim-cell">Width</th>
                                <th class="dim-cell">Height</th>
                                <th class="process-cell">DTG</th>
                                <th class="process-cell">EMB</th>
                                <th class="process-cell">SCR</th>
                                <th class="process-cell">HTV</th>
                                <th class="process-cell">DTF</th>
                                <th class="process-cell">BH Only</th>
                                <th style="width:56px;">&nbsp;</th>
                            </tr>
                        </thead>
                        <tbody id="areasEditorTbody"></tbody>
                    </table>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" type="button" data-action="cancel">Cancel</button>
                <button class="btn btn-primary" type="button" data-action="ok">OK</button>
            </div>
        </div>
    `;

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    renderAreasEditorRows();

    overlay.querySelector('[data-action="close"]').addEventListener('click', closeDecorationAreasModal);
    overlay.querySelector('[data-action="cancel"]').addEventListener('click', () => {
        // revert group changes in editor by reloading state from saved snapshot
        decorationState = deepClone(decorationSaved);
        closeDecorationAreasModal();
        initDecorationAreasPage();
    });
    overlay.querySelector('[data-action="ok"]').addEventListener('click', () => {
        closeDecorationAreasModal();
        renderDecorationGroups();
    });
    overlay.querySelector('[data-action="add-area"]').addEventListener('click', () => {
        addAreaToCurrentGroup();
        renderAreasEditorRows();
    });
}

function closeDecorationAreasModal() {
    const overlay = document.getElementById('decorationAreasModal');
    if (!overlay) return;
    overlay.classList.remove('open');
    overlay.innerHTML = '';

    // restore body scroll if no other modals are open
    if (document.querySelectorAll('.modal-overlay.open').length === 0) {
        document.body.style.overflow = '';
    }

    currentEditGroupKey = null;
}

function renderAreasEditorRows() {
    const tbody = document.getElementById('areasEditorTbody');
    if (!tbody || !currentEditGroupKey) return;

    const group = decorationState.groups[currentEditGroupKey];
    if (!group) return;

    tbody.innerHTML = (group.areas || []).map((a, idx) => {
        const icon = resolveIcon(group.icon);
        const width = a.width === null || typeof a.width === 'undefined' ? '' : a.width;
        const height = a.height === null || typeof a.height === 'undefined' ? '' : a.height;

        return `
            <tr data-area-idx="${idx}">
                <td class="checkbox-cell"><input type="checkbox" data-field="enabled" ${a.enabled ? 'checked' : ''} /></td>
                <td class="icon-cell"><i class="fas ${escapeHtml(icon)}"></i></td>
                <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span class="pill-id">${escapeHtml(a.id)}</span>
                        <span>${escapeHtml(a.name)}</span>
                    </div>
                </td>
                <td><button class="btn-link" type="button" data-action="rename">rename</button></td>
                <td class="dim-cell"><input class="input input-sm" data-field="width" type="number" step="0.01" min="0" value="${escapeHtml(width)}" placeholder="N/A" /></td>
                <td class="dim-cell"><input class="input input-sm" data-field="height" type="number" step="0.01" min="0" value="${escapeHtml(height)}" placeholder="N/A" /></td>
                <td class="process-cell"><input type="checkbox" data-proc="dtg" ${a.processes.dtg ? 'checked' : ''} /></td>
                <td class="process-cell"><input type="checkbox" data-proc="emb" ${a.processes.emb ? 'checked' : ''} /></td>
                <td class="process-cell"><input type="checkbox" data-proc="scr" ${a.processes.scr ? 'checked' : ''} /></td>
                <td class="process-cell"><input type="checkbox" data-proc="htv" ${a.processes.htv ? 'checked' : ''} /></td>
                <td class="process-cell"><input type="checkbox" data-proc="dtf" ${a.processes.dtf ? 'checked' : ''} /></td>
                <td class="process-cell"><input type="checkbox" data-field="bhOnly" ${a.bhOnly ? 'checked' : ''} /></td>
                <td style="text-align:right;"><span class="drag-handle" title="Drag to reorder (coming soon)">⋮⋮</span></td>
            </tr>
        `;
    }).join('');

    tbody.querySelectorAll('tr[data-area-idx]').forEach(tr => {
        const idx = Number(tr.getAttribute('data-area-idx'));
        const area = decorationState.groups[currentEditGroupKey].areas[idx];

        tr.querySelector('[data-field="enabled"]').addEventListener('change', (e) => {
            area.enabled = !!e.target.checked;
        });
        tr.querySelector('[data-field="bhOnly"]').addEventListener('change', (e) => {
            area.bhOnly = !!e.target.checked;
        });

        tr.querySelector('[data-field="width"]').addEventListener('input', (e) => {
            area.width = e.target.value === '' ? null : parseFloat(e.target.value);
        });
        tr.querySelector('[data-field="height"]').addEventListener('input', (e) => {
            area.height = e.target.value === '' ? null : parseFloat(e.target.value);
        });

        tr.querySelectorAll('[data-proc]').forEach(cb => {
            cb.addEventListener('change', () => {
                const k = cb.getAttribute('data-proc');
                if (!k) return;
                area.processes[k] = !!cb.checked;
            });
        });

        tr.querySelector('[data-action="rename"]').addEventListener('click', () => {
            const next = prompt('Rename area', area.name);
            if (next === null) return;
            const trimmed = String(next).trim();
            if (!trimmed) return;
            area.name = trimmed;
            renderAreasEditorRows();
        });
    });
}

function addAreaToCurrentGroup() {
    if (!currentEditGroupKey) return;
    const g = decorationState.groups[currentEditGroupKey];
    if (!g) return;

    const nextId = nextAreaId(g.areas || []);
    g.areas.push(area(nextId, 'New Area', null, null, allProc()));
}

function nextAreaId(areas) {
    const ids = (areas || []).map(a => Number(a.id)).filter(n => Number.isFinite(n));
    const max = ids.length ? Math.max(...ids) : 0;
    return max + 1;
}

function loadDecorationAreasState() {
    decorationState = deepClone(DEFAULT_DECORATION_STATE);
    decorationSaved = deepClone(DEFAULT_DECORATION_STATE);

    try {
        const raw = localStorage.getItem(DECORATION_AREAS_STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return;

        // Merge carefully to keep defaults if missing
        decorationState.scaleOnDimensionChange = parsed.scaleOnDimensionChange !== false;

        const mergedGroups = deepClone(DEFAULT_DECORATION_STATE.groups);
        if (parsed.groups && typeof parsed.groups === 'object') {
            Object.keys(parsed.groups).forEach(k => {
                if (!mergedGroups[k]) return;
                const src = parsed.groups[k];
                mergedGroups[k].enabled = src.enabled !== false;
                mergedGroups[k].name = typeof src.name === 'string' ? src.name : mergedGroups[k].name;
                mergedGroups[k].icon = typeof src.icon === 'string' ? src.icon : mergedGroups[k].icon;

                if (Array.isArray(src.areas)) {
                    mergedGroups[k].areas = src.areas.map(a => normalizeArea(a));
                }
            });
        }

        decorationState.groups = mergedGroups;
        decorationSaved = deepClone(decorationState);

    } catch {
        // ignore
    }
}

function persistDecorationAreasState() {
    localStorage.setItem(DECORATION_AREAS_STORAGE_KEY, JSON.stringify(decorationState));
}

function normalizeArea(a) {
    const base = area(0, 'Area', null, null, allProc());
    const id = Number(a.id);
    base.id = Number.isFinite(id) ? id : 0;
    base.name = typeof a.name === 'string' ? a.name : base.name;
    base.enabled = a.enabled !== false;
    base.width = a.width === null || typeof a.width === 'undefined' ? null : Number(a.width);
    base.height = a.height === null || typeof a.height === 'undefined' ? null : Number(a.height);
    base.bhOnly = !!a.bhOnly;
    base.processes = {
        dtg: !!a.processes?.dtg,
        emb: !!a.processes?.emb,
        scr: !!a.processes?.scr,
        htv: !!a.processes?.htv,
        dtf: !!a.processes?.dtf
    };
    return base;
}

function area(id, name, width, height, processes) {
    return {
        id,
        name,
        enabled: true,
        width,
        height,
        processes,
        bhOnly: false
    };
}

function allProc() {
    return { dtg: true, emb: true, scr: true, htv: true, dtf: true };
}

function proc(overrides) {
    return {
        dtg: !!overrides.dtg,
        emb: !!overrides.emb,
        scr: !!overrides.scr,
        htv: !!overrides.htv,
        dtf: !!overrides.dtf
    };
}

function resolveIcon(icon) {
    // Allow custom icons, fallback safe ones
    const allowed = new Set([
        'fa-shirt',
        'fa-baby',
        'fa-person-walking',
        'fa-hat-cowboy',
        'fa-bag-shopping',
        'fa-border-all',
        'fa-person-apron'
    ]);
    return allowed.has(icon) ? icon : 'fa-shirt';
}

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}
