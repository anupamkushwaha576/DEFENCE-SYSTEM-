const reports = {
  r1: { desk: 'Northern Area Information Review Desk', area: 'Northern area · Example' },
  r2: { desk: 'Central Area Information Review Desk', area: 'Central area · Example' },
  r3: { desk: 'Southern Area Information Review Desk', area: 'Southern area · Example' }
};

function selectReport(id) {
  document.querySelectorAll('[data-report]').forEach((item) => {
    item.classList.toggle('active', item.classList.contains('pin') && item.dataset.report === id);
    item.classList.toggle('selected', item.classList.contains('report-item') && item.dataset.report === id);
  });
  const report = reports[id];
  if (report) {
    document.getElementById('deskName').textContent = report.desk;
    document.getElementById('deskArea').textContent = report.area;
    document.getElementById('deskFeedback').textContent = report.verdict
      ? `Demo review marked this report ${report.verdict}. No official verification was performed.`
      : '';
  }
}

document.querySelectorAll('[data-report]').forEach((item) => {
  item.addEventListener('click', () => selectReport(item.dataset.report));
});

document.querySelectorAll('[data-verdict]').forEach((button) => {
  button.addEventListener('click', () => {
    const selectedItem = document.querySelector('.report-item.selected');
    if (!selectedItem) {
      document.getElementById('deskFeedback').textContent = 'Select a report before adding a demo review result.';
      return;
    }

    const id = selectedItem.dataset.report;
    const verdict = button.dataset.verdict;
    reports[id].verdict = verdict === 'correct' ? 'Correct' : 'False';

    const status = selectedItem.querySelector('.status-pill');
    status.textContent = `Marked ${reports[id].verdict.toLowerCase()} · Demo`;
    status.classList.remove('pending-pill', 'review-pill', 'checked-pill', 'verdict-correct', 'verdict-false');
    status.classList.add(verdict === 'correct' ? 'verdict-correct' : 'verdict-false');

    document.querySelectorAll('.pin[data-report]').forEach((pin) => {
      if (pin.dataset.report === id) {
        pin.classList.remove('verdict-correct', 'verdict-false');
        pin.classList.add(`verdict-${verdict}`);
      }
    });
    document.getElementById('deskFeedback').textContent = `Demo review marked this report ${reports[id].verdict}. No official verification was performed.`;
  });
});

const imageInput = document.getElementById('imageEvidence');
const imagePreview = document.getElementById('imagePreview');
let imagePreviewUrl = null;

function clearImagePreview() {
  if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
  imagePreviewUrl = null;
  imagePreview.hidden = true;
  document.getElementById('imagePreviewPhoto').removeAttribute('src');
  document.getElementById('imageFileName').textContent = '';
  imageInput.value = '';
}

imageInput.addEventListener('change', () => {
  const file = imageInput.files[0];
  if (!file) {
    clearImagePreview();
    return;
  }
  if (!file.type.startsWith('image/')) {
    clearImagePreview();
    document.getElementById('formFeedback').textContent = 'Please choose an image file.';
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    clearImagePreview();
    document.getElementById('formFeedback').textContent = 'Choose an image smaller than 5 MB.';
    return;
  }

  if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
  imagePreviewUrl = URL.createObjectURL(file);
  document.getElementById('imagePreviewPhoto').src = imagePreviewUrl;
  document.getElementById('imageFileName').textContent = file.name;
  imagePreview.hidden = false;
  document.getElementById('formFeedback').textContent = '';
});

document.getElementById('removeImage').addEventListener('click', clearImagePreview);

const areaSelect = document.getElementById('area');
const customAreaField = document.getElementById('customAreaField');
const customAreaInput = document.getElementById('customArea');

function updateAreaDetails() {
  const areas = {
    'Northern area': reports.r1,
    'Central area': reports.r2,
    'Southern area': reports.r3
  };
  const isCustomArea = areaSelect.value === 'new-place';
  customAreaField.hidden = !isCustomArea;
  customAreaInput.required = isCustomArea;

  const customArea = customAreaInput.value.trim();
  const desk = areas[areaSelect.value];
  if (isCustomArea && customArea) {
    document.getElementById('deskName').textContent = `${customArea} Information Review Desk`;
    document.getElementById('deskArea').textContent = `${customArea} · Example`;
  } else {
    document.getElementById('deskName').textContent = desk ? desk.desk : 'Area not shared';
    document.getElementById('deskArea').textContent = desk ? desk.area : isCustomArea ? 'Enter a place name · Example' : 'Example · No area selected';
  }
}

areaSelect.addEventListener('change', updateAreaDetails);
customAreaInput.addEventListener('input', updateAreaDetails);

document.getElementById('reportForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const claim = document.getElementById('claim').value.trim();
  if (!claim) return;

  const area = areaSelect.value === 'new-place'
    ? customAreaInput.value.trim()
    : areaSelect.value;
  const count = document.querySelectorAll('.report-item').length + 1;
  const id = `new-${Date.now()}`;
  const listItem = document.createElement('button');
  listItem.type = 'button';
  listItem.className = 'report-item';
  listItem.dataset.report = id;

  const number = document.createElement('span');
  number.className = 'report-number';
  number.textContent = String(count).padStart(2, '0');
  const info = document.createElement('span');
  info.className = 'report-info';
  const title = document.createElement('strong');
  title.textContent = claim;
  const subtitle = document.createElement('small');
  subtitle.textContent = `${area} · Just now`;
  info.append(title, subtitle);
  const status = document.createElement('span');
  status.className = 'status-pill pending-pill';
  status.textContent = 'Demo report';
  listItem.append(number, info, status);
  document.getElementById('reportList').prepend(listItem);
  listItem.addEventListener('click', () => selectReport(id));

  const pin = document.createElement('button');
  pin.type = 'button';
  pin.className = 'pin pin-one';
  pin.dataset.report = id;
  pin.textContent = count;
  pin.setAttribute('aria-label', `New demo report ${count}`);
  pin.style.left = `${20 + (count * 13) % 65}%`;
  pin.style.top = `${19 + (count * 17) % 60}%`;
  document.getElementById('mapCanvas').append(pin);
  pin.addEventListener('click', () => selectReport(id));
  reports[id] = { desk: area === 'Do not share area' ? 'Area not shared' : `${area} Information Review Desk`, area: `${area} · Example` };
  document.getElementById('reportCount').textContent = `${String(count).padStart(2, '0')} samples`;
  document.getElementById('formFeedback').textContent = imageInput.files.length
    ? 'Demo report added to the page. The image stayed on this device and was not uploaded.'
    : 'Demo report added to the page. It was not sent to a real desk.';
  clearImagePreview();
  event.target.reset();
  updateAreaDetails();
});

document.getElementById('messageButton').addEventListener('click', () => {
  const selectedReport = document.querySelector('.report-item.selected');
  const title = selectedReport?.querySelector('.report-info strong')?.textContent || 'Selected report';
  const area = selectedReport?.querySelector('.report-info small')?.textContent.split(' · ')[0] || 'Area not shared';
  const message = document.getElementById('message');
  message.value = `Please verify this report: ${title} (reported from ${area}).`;
  message.focus();
  message.scrollIntoView({ behavior: 'smooth', block: 'center' });
  document.getElementById('deskFeedback').textContent = 'Verification request prepared for the example desk. It has not been sent.';
});
