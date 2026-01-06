const calculateBMI = (weight, height) => {
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return Number(bmi.toFixed(2));
  };
  
  const getBMIResult = (bmi) => {
    let category, healthRisk, recommendations;
  
    if (bmi < 18.5) {
      category = 'Underweight';
      healthRisk = 'Moderate';
      recommendations = 'Increase calorie intake with nutrient-rich foods. Consult a nutritionist.';
    } else if (bmi >= 18.5 && bmi < 25) {
      category = 'Normal weight';
      healthRisk = 'Low';
      recommendations = 'Maintain your healthy lifestyle with balanced diet and regular exercise.';
    } else if (bmi >= 25 && bmi < 30) {
      category = 'Overweight';
      healthRisk = 'Moderate';
      recommendations = 'Consider reducing calorie intake and increasing physical activity.';
    } else {
      category = 'Obese';
      healthRisk = 'High';
      recommendations = 'Consult a healthcare provider for a personalized weight management plan.';
    }
  
    return { category, healthRisk, recommendations };
  };
  
  const getIdealWeightRange = (height) => {
    const heightInMeters = height / 100;
    return {
      min: Number((18.5 * heightInMeters * heightInMeters).toFixed(1)),
      max: Number((24.9 * heightInMeters * heightInMeters).toFixed(1))
    };
  };
  
  module.exports = {
    calculateBMI,
    getBMIResult,
    getIdealWeightRange
  };
  