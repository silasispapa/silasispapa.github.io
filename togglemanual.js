function toggleManual() {
    if(!stopbtn_call)
    {   
        const manualModal = document.getElementById('manualModal');
        const manualButton = document.getElementById('manualButton');
        //manualModal.style.display = (manualModal.style.display === 'block') ? 'none' : 'block';
        
        //block = opened, none = closed
        if (manualModal.style.display === 'block') {
            manualModal.style.display = 'none';
            manualButton.innerHTML = 'Guide📘';
            document.body.classList.remove('guide-modal-open');
            document.body.style.backdropFilter = '';
            windowSizeCheck();
            drawcameraarea();
        } else {
            manualModal.style.display = 'block';
            manualButton.innerHTML = 'Guide📖';
            document.body.classList.add('guide-modal-open');
            document.body.style.backdropFilter = 'blur(5px)';
        }
    }
}
  