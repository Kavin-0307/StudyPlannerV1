from nlp_pipeline import process_text

text = """
Thermodynamics is the study of heat and energy.
Heat transfer occurs through conduction, convection and radiation.
Entropy measures disorder in a system.
The first law of thermodynamics states that energy is conserved.
"""

result = process_text(text)

print(result["keywords"])
print(result["summary"])
print(result["important_points"])
print(result["revision_sheet"])