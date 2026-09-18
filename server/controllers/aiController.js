import Resume from "../models/Resume.js";
import ai from "../configs/ai.js";

// Function 1: enhance professional summary
export const enhanceProfessionalSummary = async (req, res) => {
    try {
        const { userContent } = req.body;
        if(!userContent) return res.status(400).json({message: 'Missing required fields'})

        const model = ai.getGenerativeModel({ model: "gemini-3.5-flash" });
        const prompt = `You are an expert in resume writing. Your task is to enhance the professional summary of a resume. The summary should be 1-2 sentences also highlighting key skills, experience, and career objectives. Make it compelling and ATS-friendly. and only return text no options or anything else.
        User input: ${userContent}`;
        
        const result = await model.generateContent(prompt);
        const enhancedContent = result.response.text();  // ✅ fix!

        return res.status(200).json({enhancedContent})
    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}

// Function 2: enhance job description
export const enhanceJobDescription = async (req, res) => {
    try {
        const { userContent } = req.body;
        if(!userContent) return res.status(400).json({message: 'Missing required fields'})

        const model = ai.getGenerativeModel({ model: "gemini-3.5-flash" });
        const prompt = `You are an expert in resume writing. Your task is to enhance the job description of a resume. The job description should be only in 1-2 sentence also highlighting key responsibilities and achievements. Use action verbs and quantifiable results where possible. Make it ATS-friendly. and only return text no options or anything else.
        User input: ${userContent}`;

        const result = await model.generateContent(prompt);
        const enhancedContent = result.response.text();  // ✅ fix!

        return res.status(200).json({enhancedContent})
    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}

// Function 3: upload resume
export const uploadResume = async (req, res) => {
    try {
        const {resumeText, title} = req.body;
        const userId = req.userId;
        if(!resumeText) return res.status(400).json({message: 'Missing required fields'})

        const model = ai.getGenerativeModel({ model: "gemini-3.5-flash" });
        const prompt = `You are an expert AI Agent to extract data from resume.
        extract data from this resume: ${resumeText}
        
        Provide data in the following JSON format with no additional text before or after:
        {
            "professional_summary": "",
            "skills": [],
            "personal_info": {
                "image": "", "full_name": "", "profession": "",
                "email": "", "phone": "", "location": "",
                "linkedin": "", "website": ""
            },
            "experience": [{
                "company": "", "position": "", "start_date": "",
                "end_date": "", "description": "", "is_current": false
            }],
            "project": [{"name": "", "type": "", "description": ""}],
            "education": [{
                "institution": "", "degree": "", "field": "",
                "graduation_date": "", "gpa": ""
            }]
        }`;

        const result = await model.generateContent(prompt);
        let extractedData = result.response.text();  // ✅ fix!
        
        // JSON parse karo
        extractedData = extractedData.replace(/```json|```/g, '').trim();
        const parsedData = JSON.parse(extractedData);
        
        const newResume = await Resume.create({userId, title, ...parsedData})
        res.json({resumeId: newResume._id})
    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}