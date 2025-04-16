import { IonPage, IonContent, IonSelect, IonSelectOption, IonInput, IonButton } from '@ionic/react';
import { useState } from 'react';
import { useCamera } from '@capacitor-community/camera-react';
import { submitExpense } from '../services/api';

const EXPENSE_TYPES = ['CNG', 'Toll', 'Maintenance', 'Other'];
const PAYMENT_METHODS = ['Cash', 'Online'];

export default function ExpenseForm() {
  const { getPhoto } = useCamera();
  const [form, setForm] = useState({
    type: 'CNG',
    amount: '',
    paymentMethod: 'Cash',
    receiptImage: null,
    notes: ''
  });

  const captureReceipt = async () => {
    const image = await getPhoto({
      quality: 85,
      allowEditing: true,
      resultType: 'base64'
    });
    setForm({...form, receiptImage: image.base64String});
  };

  const handleSubmit = async () => {
    await submitExpense({
      ...form,
      timestamp: new Date().toISOString()
    });
    // Reset form after submission
    setForm({
      type: 'CNG',
      amount: '',
      paymentMethod: 'Cash',
      receiptImage: null,
      notes: ''
    });
  };

  return (
    <IonPage>
      <IonContent>
        <IonSelect 
          value={form.type}
          onIonChange={e => setForm({...form, type: e.detail.value})}
        >
          {EXPENSE_TYPES.map(type => (
            <IonSelectOption key={type} value={type}>{type}</IonSelectOption>
          ))}
        </IonSelect>

        <IonInput
          type="number"
          value={form.amount}
          onIonChange={e => setForm({...form, amount: e.detail.value})}
          placeholder="Amount"
        />

        <IonSelect 
          value={form.paymentMethod}
          onIonChange={e => setForm({...form, paymentMethod: e.detail.value})}
        >
          {PAYMENT_METHODS.map(method => (
            <IonSelectOption key={method} value={method}>{method}</IonSelectOption>
          ))}
        </IonSelect>

        <IonButton onClick={captureReceipt}>
          {form.receiptImage ? 'Update Receipt' : 'Upload Receipt'}
        </IonButton>

        <IonButton 
          onClick={handleSubmit}
          disabled={!form.amount || (form.paymentMethod === 'Cash' && !form.receiptImage)}
        >
          Submit Expense
        </IonButton>
      </IonContent>
    </IonPage>
  );
}
