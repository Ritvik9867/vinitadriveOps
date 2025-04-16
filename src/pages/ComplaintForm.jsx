import { IonPage, IonContent, IonTextarea, IonButton, IonItem, IonLabel } from '@ionic/react';
import { useState } from 'react';
import { useCamera } from '@capacitor-community/camera-react';
import { submitComplaint } from '../services/api';

export default function ComplaintForm() {
  const { getPhoto } = useCamera();
  const [complaint, setComplaint] = useState({
    description: '',
    image: null,
    category: 'General'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const captureImage = async () => {
    const image = await getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: 'base64'
    });
    setComplaint({...complaint, image: image.base64String});
  };

  const handleSubmit = async () => {
    if (!complaint.description) return;
    
    setIsSubmitting(true);
    try {
      await submitComplaint({
        ...complaint,
        timestamp: new Date().toISOString(),
        status: 'Pending'
      });
      // Reset form after successful submission
      setComplaint({
        description: '',
        image: null,
        category: 'General'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <IonPage>
      <IonContent>
        <IonItem>
          <IonLabel>Complaint Type:</IonLabel>
          <select 
            value={complaint.category}
            onChange={e => setComplaint({...complaint, category: e.target.value})}
          >
            <option value="General">General</option>
            <option value="Vehicle">Vehicle Issue</option>
            <option value="Payment">Payment Related</option>
          </select>
        </IonItem>

        <IonTextarea
          value={complaint.description}
          onIonChange={e => setComplaint({...complaint, description: e.detail.value})}
          placeholder="Describe your complaint in detail"
          rows={6}
        />

        <IonButton onClick={captureImage}>
          {complaint.image ? 'Change Image' : 'Add Image (Optional)'}
        </IonButton>

        <IonButton 
          onClick={handleSubmit}
          disabled={!complaint.description || isSubmitting}
          expand="block"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
        </IonButton>
      </IonContent>
    </IonPage>
  );
}
