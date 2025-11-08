let currentEditId = null;

// Function to submit a new journal entry or update existing one
async function submitJournal() {
    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();
    const submitBtn = document.getElementById('submitBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    if (!title || !content) {
        alert('Please fill in both title and content');
        return;
    }

    try {
        const method = currentEditId ? 'PUT' : 'POST';
        const url = currentEditId 
            ? `/api/journals/${currentEditId}`
            : '/api/journals';

        console.log('Submitting to:', url, 'Method:', method);

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, content }),
        });

        const result = await response.json();

        if (response.ok) {
            document.getElementById('title').value = '';
            document.getElementById('content').value = '';
            currentEditId = null;
            submitBtn.textContent = 'Save Journal';
            cancelBtn.style.display = 'none';
            loadJournals();
            alert(method === 'PUT' ? 'Journal updated successfully!' : 'Journal saved successfully!');
        } else {
            alert(`Error: ${result.message || 'Unknown error occurred'}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert(`Error: ${error.message}`);
    }
}

// Function to cancel editing
function cancelEdit() {
    const submitBtn = document.getElementById('submitBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    document.getElementById('title').value = '';
    document.getElementById('content').value = '';
    currentEditId = null;
    submitBtn.textContent = 'Save Journal';
    cancelBtn.style.display = 'none';
}

// Function to start editing a journal
function editJournal(journal) {
    try {
        console.log('Editing journal:', journal);
        const submitBtn = document.getElementById('submitBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        
        if (!journal || !journal._id) {
            console.error('Invalid journal data:', journal);
            alert('Error: Invalid journal data');
            return;
        }

        document.getElementById('title').value = journal.title || '';
        document.getElementById('content').value = journal.content || '';
        currentEditId = journal._id;
        submitBtn.textContent = 'Update Journal';
        cancelBtn.style.display = 'inline-block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        console.error('Error in editJournal:', error);
        alert('Error preparing to edit journal');
    }
}

// Function to delete a journal
async function deleteJournal(journalId) {
    if (!confirm('Are you sure you want to delete this journal entry?')) {
        return;
    }

    try {
        const response = await fetch(`/api/journals/${journalId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            loadJournals();
        } else {
            alert('Error deleting journal');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting journal');
    }
}

// Function to load and display journal entries
async function loadJournals() {
    try {
        const response = await fetch('/api/journals');
        const journals = await response.json();

        const journalList = document.getElementById('journalList');
        journalList.innerHTML = '';

        journals.forEach(journal => {
            const journalEntry = document.createElement('div');
            journalEntry.className = 'journal-entry';
            journalEntry.innerHTML = `
                <h3>${journal.title}</h3>
                <p>${journal.content}</p>
                <div class="date">${journal.date}</div>
                <div class="journal-actions">
                    <button class="edit-btn" onclick='editJournal(${JSON.stringify(journal).replace(/'/g, "\\'")})'">Edit</button>
                    <button class="delete-btn" onclick="deleteJournal('${journal._id}')">Delete</button>
                </div>
            `;
            journalList.appendChild(journalEntry);
        });
    } catch (error) {
        console.error('Error:', error);
        alert('Error loading journals');
    }
}

// Load journals when the page loads
document.addEventListener('DOMContentLoaded', loadJournals);