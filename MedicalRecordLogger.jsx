
import { MedicalRecord } from "@/api/entities";

/**
 * Utility class for automatically logging medical record entries
 */
export class MedicalRecordLogger {
  
  static async logEntry(patientId, patientName, entryData) {
    try {
      // Find existing medical record for this patient
      let medicalRecord = null;
      try {
        const records = await MedicalRecord.filter({ patient_id: patientId });
        medicalRecord = records[0];
      } catch (error) {
        console.log("No existing medical record found, will create new one");
      }

      const newEntry = {
        entry_id: `${entryData.entry_type.toLowerCase().replace(/ /g, '_')}_${Date.now()}`,
        entry_date: new Date().toISOString().split('T')[0],
        entry_time: new Date().toTimeString().split(' ')[0],
        ...entryData
      };

      if (medicalRecord) {
        // Update existing medical record
        const updatedEntries = [...medicalRecord.entries, newEntry];
        await MedicalRecord.update(medicalRecord.id, {
          ...medicalRecord,
          entries: updatedEntries,
          last_updated: new Date().toISOString()
        });
      } else {
        // Create new medical record
        await MedicalRecord.create({
          patient_id: patientId,
          patient_name: patientName,
          entries: [newEntry],
          current_status: "OPD", // Default status, can be updated later by other entries like IPD Admission
          last_updated: new Date().toISOString()
        });
      }
      
      console.log(`Medical record entry logged for ${patientName}: ${entryData.entry_type}`);
    } catch (error) {
      console.error("Error logging medical record entry:", error);
    }
  }

  // Demographics entry
  static async logDemographics(patientId, patientName, demographicData) {
    await this.logEntry(patientId, patientName, {
      entry_type: "Demographics",
      department: "Reception/Demographic",
      doctor_name: demographicData.attending_nurse,
      chief_complaint: demographicData.complaint,
      vital_signs: {
        blood_pressure: demographicData.blood_pressure,
        heart_rate: demographicData.heart_rate,
        temperature: demographicData.temperature,
        weight: demographicData.weight,
        height: demographicData.height
      },
      diagnosis: demographicData.diagnosis,
      notes: demographicData.notes,
      created_by: demographicData.attending_nurse
    });
  }

  // Pre-OPD consultation
  static async logPreOPDConsultation(patientId, patientName, consultationData) {
    await this.logEntry(patientId, patientName, {
      entry_type: "OPD Visit",
      department: "Pre-OPD",
      doctor_name: consultationData.doctor_name || "Pre-OPD Staff",
      chief_complaint: consultationData.complaint,
      diagnosis: consultationData.diagnosis,
      treatment_plan: consultationData.treatment_plan,
      notes: consultationData.notes,
      created_by: consultationData.doctor_name || "Pre-OPD Staff"
    });
  }

  // OPD Department visit
  static async logOPDVisit(patientId, patientName, visitData) {
    await this.logEntry(patientId, patientName, {
      entry_type: "OPD Visit",
      department: visitData.department,
      doctor_name: visitData.doctor_name,
      chief_complaint: visitData.chief_complaint,
      diagnosis: visitData.diagnosis,
      treatment_plan: visitData.treatment_plan,
      notes: visitData.notes,
      follow_up_date: visitData.follow_up_date,
      created_by: visitData.doctor_name
    });
  }

  // Lab order placed
  static async logLabOrder(patientId, patientName, labData) {
    await this.logEntry(patientId, patientName, {
      entry_type: "Lab Order",
      department: "Laboratory",
      doctor_name: labData.doctor_name,
      lab_orders: [{
        test_name: labData.test_name,
        test_category: labData.test_category,
        status: "Ordered"
      }],
      notes: `Lab test ordered: ${labData.test_name} (${labData.test_category})`,
      created_by: labData.doctor_name
    });
  }

  // Lab results available
  static async logLabResult(patientId, patientName, resultData) {
    await this.logEntry(patientId, patientName, {
      entry_type: "Lab Result",
      department: "Laboratory",
      doctor_name: resultData.doctor_name,
      lab_orders: [{
        test_name: resultData.test_name,
        test_category: resultData.test_category,
        result: resultData.result_value,
        report_url: resultData.report_file_url,
        report_filename: resultData.report_file_name
      }],
      attachments: resultData.report_file_url ? [{
        title: `Lab Report: ${resultData.test_name}`,
        file_name: resultData.report_file_name,
        url: resultData.report_file_url
      }] : [],
      notes: `Lab results available: ${resultData.test_name}`,
      created_by: resultData.lab_technician || "Lab Staff"
    });
  }

  // Prescription given
  static async logPrescription(patientId, patientName, prescriptionData) {
    await this.logEntry(patientId, patientName, {
      entry_type: "Prescription",
      department: prescriptionData.prescribed_by_department || "Pharmacy",
      doctor_name: prescriptionData.doctor_name,
      prescriptions: [{
        medication: prescriptionData.medication_name,
        dosage: prescriptionData.dosage,
        frequency: prescriptionData.frequency,
        duration: prescriptionData.duration
      }],
      notes: `Prescription: ${prescriptionData.medication_name} - ${prescriptionData.dosage} ${prescriptionData.frequency}`,
      created_by: prescriptionData.doctor_name
    });
  }

  // Payment/Billing
  static async logPayment(patientId, patientName, paymentData) {
    await this.logEntry(patientId, patientName, {
      entry_type: "Billing",
      department: "Accounts",
      notes: `Payment: ₹${paymentData.amount_paid} via ${paymentData.payment_method} for ${paymentData.bill_type} services`,
      created_by: "Billing Staff"
    });
  }

  // IPD Admission
  static async logAdmission(patientId, patientName, admissionData) {
    await this.logEntry(patientId, patientName, {
      entry_type: "IPD Admission",
      department: admissionData.department || "IPD",
      doctor_name: admissionData.doctor_name,
      notes: `Patient admitted to bed ${admissionData.bed_number}`,
      created_by: admissionData.doctor_name || "IPD Staff"
    });
  }

  // Discharge
  static async logDischarge(patientId, patientName, dischargeData) {
    await this.logEntry(patientId, patientName, {
      entry_type: "Discharge",
      department: "IPD",
      doctor_name: dischargeData.doctor_name,
      diagnosis: dischargeData.final_diagnosis,
      treatment_plan: dischargeData.discharge_summary,
      notes: `Patient discharged from bed ${dischargeData.bed_number}`,
      created_by: dischargeData.doctor_name || "IPD Staff"
    });
  }

  // Nursing Note
  static async logNursingNote(patientId, patientName, noteData) {
    await this.logEntry(patientId, patientName, {
      entry_type: "Nursing Note",
      department: "IPD Nursing Station",
      notes: noteData.note,
      created_by: noteData.nurse_name
    });
  }

  // Patient Charge (from nursing station)
  static async logPatientCharge(patientId, patientName, chargeData) {
    await this.logEntry(patientId, patientName, {
      entry_type: "Patient Charge",
      department: "IPD Nursing Station",
      notes: `Charge added: ${chargeData.item_name} (Qty: ${chargeData.quantity})`,
      created_by: chargeData.recorded_by_nurse_name
    });
  }
}
