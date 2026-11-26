(() => {
  const controls = document.querySelector('#demo-controls');
  const reply = document.querySelector('#demo-reply');
  const buttons = [...controls.querySelectorAll('button')];
  const responses = {
    records: 'Keep the record in question, a short timeline, and copies of any supporting documents together. Keep your originals and don’t share records or personal information in this demo.',
    credit: 'The Consumer Financial Protection Bureau publishes instructions for disputing credit report errors. You can find its guide in Official resources. This desk won’t file a dispute or contact anyone for you.',
    legal: 'No. Total Transformation Inc. is not a law firm and does not provide legal advice or representation. For legal help, use the State Bar of California referral directory or the California Courts Self-Help Guide in Official resources.',
  };

  function select(button) {
    const isSelected = button.getAttribute('aria-pressed') === 'true';
    for (const choice of buttons) {
      choice.setAttribute('aria-pressed', String(!isSelected && choice === button));
    }
    if (isSelected) {
      reply.textContent = 'Choose a question to see the assistant’s sample response.';
      return;
    }
    const label = document.createElement('strong');
    label.textContent = 'AI assistant:';
    reply.replaceChildren(label, ` “${responses[button.dataset.branch]}”`);
  }

  for (const button of buttons) {
    button.addEventListener('click', () => select(button));
  }
  controls.hidden = false;
})();
