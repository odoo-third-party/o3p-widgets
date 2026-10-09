/** @odoo-module **/

import { browser } from "@web/core/browser/browser";
import { Notebook } from "@web/core/notebook/notebook";
import { patch } from "@web/core/utils/patch";
import { session } from "@web/session";
import { onMounted, onPatched, onWillUnmount } from "@odoo/owl";

const STORAGE_KEY = "o3p_widgets.notebook_tabs.v1";
const MAX_ENTRY_AGE = 48 * 60 * 60 * 1000;
const WARNING_PREFIX = "[o3p_widgets] Notebook tab persistence";
const persistenceEnabled = session.o3p_widgets?.remember_notebook_tabs ?? false;

function warn(message, error) {
    console.warn(`${WARNING_PREFIX}: ${message}`, error);
}

function writeEntries(entries) {
    try {
        browser.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
        warn("could not write local storage", error);
    }
}

function readEntries() {
    let entries;
    try {
        const storedValue = browser.localStorage.getItem(STORAGE_KEY);
        if (!storedValue) {
            return {};
        }
        entries = JSON.parse(storedValue);
        if (!entries || Array.isArray(entries) || typeof entries !== "object") {
            throw new TypeError("stored notebook state is not an object");
        }
    } catch (error) {
        warn("could not read local storage", error);
        try {
            browser.localStorage.removeItem(STORAGE_KEY);
        } catch (cleanupError) {
            warn("could not clear invalid local storage", cleanupError);
        }
        return {};
    }

    const now = Date.now();
    let changed = false;
    for (const [key, entry] of Object.entries(entries)) {
        const valid =
            entry &&
            typeof entry === "object" &&
            typeof entry.pageId === "string" &&
            Number.isFinite(entry.updatedAt) &&
            now - entry.updatedAt <= MAX_ENTRY_AGE;
        if (!valid) {
            delete entries[key];
            changed = true;
        }
    }
    if (changed) {
        writeEntries(entries);
    }
    return entries;
}

function getHashParameters(hash) {
    const hashValue = hash.replace(/^#!/, "").replace(/^#/, "");
    const queryStart = hashValue.indexOf("?");
    return new URLSearchParams(queryStart >= 0 ? hashValue.slice(queryStart + 1) : hashValue);
}

function getPageUrl() {
    const url = new URL(browser.location.href);
    const hashParameters = getHashParameters(url.hash);
    const identityParameters = new URLSearchParams();
    for (const parameterName of ["id", "model"]) {
        const value = hashParameters.get(parameterName) ?? url.searchParams.get(parameterName);
        if (value !== null) {
            identityParameters.set(parameterName, value);
        }
    }
    const identityQuery = identityParameters.toString();
    return `${url.origin}${url.pathname}${identityQuery ? `?${identityQuery}` : ""}`;
}

function getNotebookStorageId(notebook) {
    const notebookElement = notebook.activePane()?.closest(".o_notebook");
    if (!notebookElement) {
        return null;
    }
    const notebookIndex = Array.from(document.querySelectorAll(".o_notebook")).indexOf(
        notebookElement
    );
    if (notebookIndex < 0) {
        return null;
    }
    return `${getPageUrl()}::notebook[${notebookIndex}]`;
}

function forgetEntry(storageId, entries) {
    delete entries[storageId];
    writeEntries(entries);
}

function rememberCurrentPage(notebook) {
    const storageId = getNotebookStorageId(notebook);
    if (!storageId || typeof notebook.state.currentPage !== "string") {
        return;
    }
    const entries = readEntries();
    entries[storageId] = {
        pageId: notebook.state.currentPage,
        updatedAt: Date.now(),
    };
    writeEntries(entries);
}

async function restoreCurrentPage(notebook, storageId) {
    const entries = readEntries();
    const entry = entries[storageId];
    if (!entry) {
        return;
    }
    if (!notebook.navItems.some(([pageId]) => pageId === entry.pageId)) {
        forgetEntry(storageId, entries);
        return;
    }
    try {
        await notebook.activatePage(entry.pageId);
        if (notebook.state.currentPage !== entry.pageId) {
            forgetEntry(storageId, entries);
        }
    } catch (error) {
        warn("could not restore the saved tab", error);
    }
}

function scheduleRestore(notebook) {
    browser.cancelAnimationFrame(notebook.o3pNotebookRestoreFrame);
    notebook.o3pNotebookRestoreFrame = browser.requestAnimationFrame(() => {
        const storageId = getNotebookStorageId(notebook);
        if (!storageId || storageId === notebook.o3pNotebookStorageId) {
            return;
        }
        notebook.o3pNotebookStorageId = storageId;
        restoreCurrentPage(notebook, storageId);
    });
}

if (persistenceEnabled) {
    patch(Notebook.prototype, {
        setup() {
            super.setup(...arguments);
            this.o3pNotebookStorageId = null;
            this.o3pNotebookRestoreFrame = null;
            onMounted(() => scheduleRestore(this));
            onPatched(() => scheduleRestore(this));
            onWillUnmount(() => browser.cancelAnimationFrame(this.o3pNotebookRestoreFrame));
        },

        async activatePage(pageIndex) {
            await super.activatePage(...arguments);
            if (this.state.currentPage === pageIndex) {
                rememberCurrentPage(this);
            }
        },
    });
}
