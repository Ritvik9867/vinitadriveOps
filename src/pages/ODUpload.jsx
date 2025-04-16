import { IonPage, IonContent, IonButton, IonInput } from '@ionic/react';
import { useState } from 'react';
import { useCamera } from '@capacitor-community/camera-react';
import { submitOD } from '../services/api';

export default function ODUpload() {
  const { getPhoto } = useCamera();
  const [odImage, setOdImage] = useState('');
  const [odReading, setOdReading] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const captureOD = async () => {
    const image = await getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: 'base64'
    });
    setOdImage(image.base64String);
  };

  const handleSubmit = async () => {
    if (!odImage || !odReading) return;
    
    setIsLoading(true);
    try {
      await submitOD({
        image: odImage,
        reading: odReading,
        timestamp: new Date().toISOString()
      });
      // Show success message
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent>
        <IonButton onClick={captureOD}>
          {odImage ? 'Retake OD Photo' : 'Take OD Photo'}
        </IonButton>
        
        <IonInput 
          value={odReading}
          onIonChange={e => setOdReading(e.detail.value)}
          placeholder="Enter OD Reading"
          type="number"
        />
        
        <IonButton 
          onClick={handleSubmit}
          disabled={!odImage || !odReading || isLoading}
        >
          Submit
        </IonButton>
      </IonContent>
    </IonPage>
  );
}
