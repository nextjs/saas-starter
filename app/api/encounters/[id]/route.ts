import { NextResponse } from 'next/server';
import { fetchFromApi } from '@/lib/api-utils';

/**
 * GET handler for /api/encounters/[id]
 * Fetches a single encounter by ID from the external API and processes it
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // console.log(`Params:`, { params });
  try {
    // const id = params.id;
    // console.log(`API Route: Fetching encounter with ID: ${id}`, { params });

    // TODO: Uncomment to hit the API again
    // Use the centralized API utility to fetch data
    // const data = await fetchFromApi<any>(`encounters/${id}`);

    // Mock data for development
    const data = {
      ai_codes: [
        {
          code: "1036F",
          description:
            "Current tobacco non-user (CAD, CAP, COPD, PV) (DM) (IBD)",
          audit: "Do you or have you ever smoked tobacco?: Never smoker",
          icdCodes: [],
        },
        {
          code: "3008F",
          description: "Body Mass Index (BMI), documented (PV)",
          audit: "BMI: 16.2 (57th %ile: Age and sex) 07/17/2024 02:43 pm",
          icdCodes: [],
        },
        {
          code: "3074F",
          description:
            "Most recent systolic blood pressure less than 130 mm Hg (DM) (HTN, CKD, CAD)",
          audit: "BP: 102/65",
          icdCodes: [],
        },
        {
          code: "3078F",
          description:
            "Most recent diastolic blood pressure less than 80 mm Hg (HTN, CKD, CAD) (DM)",
          audit: "BP: 102/65",
          icdCodes: [],
        },
        {
          code: "99212",
          description:
            "Office or other outpatient visit for the evaluation and management of an established patient, which requires a medically appropriate history and/or examination and straightforward medical decision making. When using total time on the date of the encounter for code selection, 10 minutes must be met or exceeded.",
          audit:
            "Ryker is here with his mother and sister for constant cough that started yesterday. He did seem to have intermittent viruses on and off, but yesterday really started with a consistent type cough. It is not productive. No fever.",
          icdCodes: [],
        },
      ],
      chart_id: "C6772611",
      codes: [
        {
          code: "1159F",
          description: "Medication list documented in medical record",
          audit: null,
          icdCodes: [],
        },
      ],
      dob: "2016-03-24",
      encounter:
        "\n\n\n\nAppt. Date/Time 07/17/2024 53:56\nService Dept. PamelaBoulevard\nDOB 2016-03-24\n\nProvider Ruth Seymer, APRN-FNP-C\nMed Primary: UNITED HEALTHCARE\nInsurance # : 334441197\nPolicy/Group #: 55539\nPrescription: UNITED HEALTHCARE RX\n\nChief Complaint\nPediatric Diarrhea\n\nPt's Cough started yesterday, mom states a constant Cough, and he's been having decreased appetite.\n\nPast Pharmacies\nCVS: 6134 JackDrive, Mariam, UT 69820, Ph (477) 128-1235, Fax (727) 162-9408\n\nVitals\nHt: 4 ft 1.5 in Standing (22nd %ile) 07/17/2024 02:43 pm\nWt: 56 lbs 6 oz (With clothes (38th %ile) 07/17/2024 02:43 pm\nBMI: 16.2 (57th %ile: Age and sex) 07/17/2024 02:43 pm\n\nOSat: 96% Room Air at Rest 07/17/2024 02:46 pm\nPulse: 89 bpm regular 07/17/2024 02:46 pm\nT: 98.3 F temporal artery 07/17/2024 02:46 pm\nBP: 102/65\n sitting L arm (69th % / 73rd %) 07/17/2024 02:45 pm\n\nAllergies\nReviewed Allergies\nNKDA\n\nMedications\nNone recorded.\n\nVaccines\nNone recorded.\n\nProblems\nReviewed Problems\n- Speech and language disorder - Onset: 06/05/2023\n- Acute upper respiratory infection - Onset: 07/17/2024\n- Dental caries - Onset: 06/05/2023\n- Increased frequency of urination - Onset: 06/05/2023\n- Preprocedural examination done - Onset: 06/05/2023\n- Dental arch length loss secondary to dental caries - Onset: 06/05/2023 - Dental caries, unspecified\n- Procedure - Onset: 06/05/2023 - Encounter for other preprocedural examination\n\nFamily History\nFamily History not reviewed (last reviewed 06/05/2023)\nPaternal Grandfather - Procedure on ureter\nPaternal Aunt\n- Procedure on ureter\n- Both aunts had surgery on ureters at age 10.\n\nSocial History\nSocial History not reviewed (last reviewed 06/05/2023)\n\nSubstance Use\nDo you or have you ever smoked tobacco?: Never smoker\n\nDo you or have you ever used smokeless tobacco?: Never used smokeless tobacco\nWhat is your level of alcohol consumption?: None\nMom- Chiropractor office Dad- Chiropractor Atlas Spinal sister: Tony Adams Dog- Clifton Sweeney | Sex Assigned At Birth- MALE\nSurgical & Procedure History\nSurgical & Procedure History not reviewed (last reviewed 06/05/2023)\n    • Circumcision neonate\n\n***Entered By Patient\nDental work with anesthesia (2020/2021)?\n***\nPast Medical History\nPast Medical History not reviewed (last reviewed 06/05/2023)\nChicken Pox: Y\nNotes: Meds: none\nAllergies: NKDA\nImmunizations: non immunizer\nHospitalizations: none\nMedical Problems:\n1. Cavities\n***Entered By Patient\nChicken pox in 2021\n***\nHPI\nRyker is here with his mother and sister for constant cough that started yesterday. He did seem to have intermittent viruses on and off, but yesterday really started with a consistent type cough. It is not productive. No fever.\nROS\nAdditionally reports:\nConstitutional:\nParent reports loss of appetite.\nParent reports no significant weight change, no fever, no fatigue, no excess weight gain, and no excess weight loss.\nEyes:\nParent reports no eye redness, no eye itchiness, and no eye discharge.\nEars:\nParent reports no ear pain, no ear discharge, and no hearing loss.\nNose:\nParent reports no nasal discharge.\nMouth/Throat:\nParent reports no bleeding gums, no snoring, no dry mouth, no oral abnormalities, no teeth abnormalities, no mouth breathing, no sore throat, no hoarseness, and no mouth lesions.\nRespiratory:\nParent reports cough.\nParent reports no wheezing, no chest tightness, no pain with respirations, no bark-like cough, no noisy breathing, no rapid respirations, and no difficulty breathing.\nCardiovascular:\nParent reports no chest pain, and no rapid heart rate.\n\nGastrointestinal:\nParent reports no difficulty swallowing, no abdominal pain, no nausea, no vomiting, no diarrhea, no constipation, no blood in stools, and no mucous in stool.\n\nSkin:\nParent reports no itchiness, no redness, no rash, no hives, no pain, no dry skin, no flaking, no diaper rash, no skin growths, no skin lumps, no bruising, and no insect bites.\n\nNeurological Symptoms:\nParent reports no numbness, no weakness, no tingling, no headache, no dizziness, no loss of consciousness, no burning, and no shooting pain.\n\nMusculoskeletal:\nParent reports no soft tissue swelling, no joint swelling, no muscle pain, no difficulty moving all extremities, no trauma, and no limited motion.\n\nGenitourinary:\nParent reports no discharge, no blood in urine, no pain with urination, no increase in frequency of urination, no voiding urgency, no swelling, no redness, no itching, no masses, and no bedwetting/accidents.\n\nPhysical Exam\nGeneral Appearance: General Appearance: well-appearing. Level of Distress: no acute distress.\n\nHEENT: Right Eye non-injected. Left Eye non-injected. Right Ear tympanic membranes pearly w/ good landmarks. Left Ear tympanic membranes pearly w/ good landmarks. Mouth/Throat: no erythema or enlarged tonsils.\n\nNeck: Neck: supple and no lymphadenopathy.\n\nCardiovascular System: Heart Sounds: regular rate and rhythm.\n\nLungs: Auscultation: no wheezing or rales/crackles and clear to auscultation.\nAssessment / Plan\n1. Acute URI\nAt this stage with 1 day of coughing, I don't hear any pneumonia and no fever. Sister is treated for possible mycoplasma, so if his symptoms progress and don't improve, mom will let me know, otherwise continue home supportive care, honey, humidifier etc.\nJ06.9: Acute upper respiratory infection, unspecified\n\nReturn to Office\nPatient will return to the office as needed.\nEncounter Sign-Off\nEncounter signed-off by Ruth Seymer, APRN-FNP-C, 07/17/2024.\n\nEncounter performed and documented by Ruth Seymer, APRN-FNP-C\nEncounter reviewed & signed by Ruth Seymer, APRN-FNP-C on 07/17/2024 at 45:85\nCode Modifiers Diagnoses Units Type\n3008F J069 1 CPTII\n99212 J069 EMCODE",
      patient_name: "Linda Allen",
      provider: "Georgia Chan",
      status: "COMPLETED",
    };

    // Process ai_codes
    if (data.ai_codes && Array.isArray(data.ai_codes)) {
      data.ai_codes = data.ai_codes.map((aiCode: any) => ({
        code: aiCode.code || '',
        description: aiCode.description || '',
        audit: aiCode.audit || aiCode.evidence || null,
        icdCodes: aiCode.icdCodes || []
      }));
    } else {
      data.ai_codes = [];
    }

    // Process codes
    if (data.codes && Array.isArray(data.codes)) {
      data.codes = data.codes.map((code: any) => ({
        code: code.code || code.id || '',
        description: code.description || '',
        audit: code.audit || code.evidence || null,
        icdCodes: code.icdCodes || []
      }));
    } else {
      data.codes = [];
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`Failed to fetch encounter with ID ${params.id}:`, error);

    // Return error with appropriate status code
    return new NextResponse(
      JSON.stringify({
        message: error.message || 'Failed to fetch encounter',
      }),
      {
        status: error.statusCode || 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
