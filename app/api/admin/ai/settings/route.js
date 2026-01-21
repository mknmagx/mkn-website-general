import { NextResponse } from "next/server";
import {
  getAiProviders,
  getAiModels,
  getAiPrompts,
  getAiConfigurations,
  getModelsByProvider,
  getPromptsByCategory,
  getConfigurationByContext,
  getFullConfigurationForContext,
  getPromptByKey,
  getAiModel,
  updateAiModel,
  updateAiPrompt,
  setAiConfiguration,
  toggleModelStatus,
  createAiModel,
  createAiPrompt,
  deleteAiModel,
  deleteAiPrompt,
} from "@/lib/services/ai-settings-service";
import { seedAiSettings, checkAiSettingsSeeded } from "@/lib/services/ai-settings-seed";

/**
 * GET /api/admin/ai/settings
 * 
 * Query params:
 * - type: providers | models | prompts | configurations | all
 * - provider: Filter models by provider
 * - category: Filter prompts by category
 * - context: Get configuration for specific context
 * - modelId: Get specific model
 * - promptKey: Get specific prompt
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all";
    const provider = searchParams.get("provider");
    const category = searchParams.get("category");
    const context = searchParams.get("context");
    const modelId = searchParams.get("modelId");
    const promptKey = searchParams.get("promptKey");

    let data = {};

    // Get specific model
    if (modelId) {
      const model = await getAiModel(modelId);
      return NextResponse.json({ success: true, model });
    }

    // Get specific prompt
    if (promptKey) {
      const prompt = await getPromptByKey(promptKey);
      return NextResponse.json({ success: true, prompt });
    }

    // Get configuration for context
    if (context) {
      const config = await getFullConfigurationForContext(context);
      return NextResponse.json({ success: true, configuration: config });
    }

    // Get data by type
    switch (type) {
      case "providers":
        data.providers = await getAiProviders();
        break;

      case "models":
        data.models = provider
          ? await getModelsByProvider(provider)
          : await getAiModels();
        break;

      case "prompts":
        data.prompts = category
          ? await getPromptsByCategory(category)
          : await getAiPrompts();
        break;

      case "configurations":
        data.configurations = await getAiConfigurations();
        break;

      case "all":
      default:
        const [providers, models, prompts, configurations, isSeeded] = await Promise.all([
          getAiProviders(),
          provider ? getModelsByProvider(provider) : getAiModels(),
          category ? getPromptsByCategory(category) : getAiPrompts(),
          getAiConfigurations(),
          checkAiSettingsSeeded(),
        ]);
        data = { providers, models, prompts, configurations, isSeeded };
        break;
    }

    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error("Error fetching AI settings:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/ai/settings
 * 
 * Body:
 * - action: seed | create_model | create_prompt | update_model | update_prompt | 
 *           update_configuration | toggle_model | delete_model | delete_prompt
 * - data: Action-specific data
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, data } = body;

    let result;

    switch (action) {
      case "seed":
        result = await seedAiSettings();
        break;

      case "create_model":
        result = await createAiModel(data);
        break;

      case "create_prompt":
        result = await createAiPrompt(data);
        break;

      case "update_model":
        result = await updateAiModel(data.modelId, data.updates);
        break;

      case "update_prompt":
        result = await updateAiPrompt(data.promptId, data.updates);
        break;

      case "update_configuration":
        result = await setAiConfiguration(data.context, data.config);
        break;

      case "toggle_model":
        result = await toggleModelStatus(data.modelId, data.isActive);
        break;

      case "delete_model":
        result = await deleteAiModel(data.modelId);
        break;

      case "delete_prompt":
        result = await deleteAiPrompt(data.promptId);
        break;

      default:
        return NextResponse.json(
          { success: false, error: "Unknown action" },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Error processing AI settings action:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
