import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "../../src/components/layout/Screen";
import { Card, Chip, ConfirmDialog, PrimaryButton, TextField } from "../../src/components/ui";
import { CategoryKind } from "../../src/lib/domain/enums";
import { useAuthFlowStore, useCategoriesStore, useMovementsStore } from "../../src/stores";
import { useAppTheme } from "../../src/theme";

const CATEGORY_COLORS = ["#005440", "#855400", "#004B84", "#BA1A1A", "#0F6E56", "#EF9F27"];
const CATEGORY_ICONS = ["🍽️", "🚌", "🏠", "💊", "✨", "💼", "🏷️", "☕"];

export default function CategoriasModal() {
  const { colors, spacing, typography } = useAppTheme();
  const user = useAuthFlowStore((state) => state.user);
  const categories = useCategoriesStore((state) => state.categories);
  const error = useCategoriesStore((state) => state.error);
  const status = useCategoriesStore((state) => state.status);
  const loadCategories = useCategoriesStore((state) => state.loadCategories);
  const createCategory = useCategoriesStore((state) => state.createCategory);
  const updateCategory = useCategoriesStore((state) => state.updateCategory);
  const archiveCategory = useCategoriesStore((state) => state.archiveCategory);
  const loadMovements = useMovementsStore((state) => state.loadMovements);
  const [name, setName] = useState("");
  const [kind, setKind] = useState(CategoryKind.EXPENSE);
  const [color, setColor] = useState(CATEGORY_COLORS[0]);
  const [icon, setIcon] = useState(CATEGORY_ICONS[6]);
  const [editingCategoryId, setEditingCategoryId] = useState("");
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [formError, setFormError] = useState("");
  const isSaving = status === "saving";
  const editingCategory = categories.find((category) => category.id === editingCategoryId);
  const expenseCategories = useMemo(
    () => categories.filter((category) => category.kind === CategoryKind.EXPENSE),
    [categories],
  );
  const incomeCategories = useMemo(
    () => categories.filter((category) => category.kind === CategoryKind.INCOME),
    [categories],
  );

  useEffect(() => {
    if (user?.uid) {
      loadCategories(user.uid);
    }
  }, [loadCategories, user?.uid]);

  function resetForm() {
    setName("");
    setKind(CategoryKind.EXPENSE);
    setColor(CATEGORY_COLORS[0]);
    setIcon(CATEGORY_ICONS[6]);
    setEditingCategoryId("");
    setFormError("");
  }

  function startEdit(category) {
    setEditingCategoryId(category.id);
    setName(category.name || "");
    setKind(category.kind || CategoryKind.EXPENSE);
    setColor(category.color || CATEGORY_COLORS[0]);
    setIcon(category.icon || CATEGORY_ICONS[6]);
  }

  async function handleSave() {
    setFormError("");

    if (!user?.uid) return;

    if (!name.trim()) {
      setFormError("Ingresa un nombre para la categoría.");
      return;
    }

    const values = { color, icon, kind, name };
    const result = editingCategory
      ? await updateCategory(user.uid, editingCategory.id, values)
      : await createCategory(user.uid, values);

    if (!result.error) {
      resetForm();
      await loadMovements(user.uid);
    }
  }

  async function handleArchive() {
    if (!user?.uid || !archiveTarget || archiveTarget.isDefault) return;

    const result = await archiveCategory(user.uid, archiveTarget.id);

    if (!result.error) {
      setArchiveTarget(null);
      if (editingCategoryId === archiveTarget.id) resetForm();
      await loadMovements(user.uid);
    }
  }

  return (
    <>
      <Screen scrollable bottomInset={32}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: colors.textPrimary, fontSize: typography.sizes.xxl }]}>
              Categorías
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Personaliza tus etiquetas financieras
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerrar categorías"
            onPress={() => router.back()}
            style={[styles.closeButton, { backgroundColor: colors.surfaceContainerLow }]}
          >
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </Pressable>
        </View>

        {status === "loading" ? (
          <ActivityIndicator style={{ marginTop: spacing.lg }} color={colors.primary} />
        ) : null}
        {error || formError ? (
          <Text style={[styles.error, { color: colors.red, marginTop: spacing.md }]}>{formError || error}</Text>
        ) : null}

        <Card style={{ marginTop: spacing.lg }}>
          <Text style={[styles.formTitle, { color: colors.textPrimary }]}>
            {editingCategory ? "Editar categoría" : "Nueva categoría"}
          </Text>
          <TextField label="Nombre" value={name} onChangeText={setName} placeholder="Ej. Mascotas" />
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Tipo</Text>
          <View style={styles.chipRow}>
            <Chip label="Gasto" active={kind === CategoryKind.EXPENSE} onPress={() => setKind(CategoryKind.EXPENSE)} />
            <Chip label="Ingreso" active={kind === CategoryKind.INCOME} onPress={() => setKind(CategoryKind.INCOME)} />
          </View>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Color</Text>
          <View style={styles.chipRow}>
            {CATEGORY_COLORS.map((option) => (
              <Pressable
                key={option}
                accessibilityRole="button"
                onPress={() => setColor(option)}
                style={[
                  styles.colorDot,
                  {
                    backgroundColor: option,
                    borderColor: color === option ? colors.textPrimary : "transparent",
                  },
                ]}
              />
            ))}
          </View>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Icono</Text>
          <View style={styles.chipRow}>
            {CATEGORY_ICONS.map((option) => (
              <Chip key={option} label={option} active={icon === option} onPress={() => setIcon(option)} />
            ))}
          </View>
          <PrimaryButton
            label={isSaving ? "Guardando..." : editingCategory ? "Guardar cambios" : "Crear categoría"}
            onPress={handleSave}
            disabled={isSaving}
            style={{ marginTop: spacing.md }}
          />
          {editingCategory ? (
            <PrimaryButton
              label="Cancelar edición"
              onPress={resetForm}
              style={{ marginTop: spacing.sm, backgroundColor: colors.gold }}
            />
          ) : null}
        </Card>

        <CategoryList
          categories={expenseCategories}
          colors={colors}
          onArchive={setArchiveTarget}
          onEdit={startEdit}
          spacing={spacing}
          title="Gastos"
        />
        <CategoryList
          categories={incomeCategories}
          colors={colors}
          onArchive={setArchiveTarget}
          onEdit={startEdit}
          spacing={spacing}
          title="Ingresos"
        />
      </Screen>
      <ConfirmDialog
        visible={Boolean(archiveTarget)}
        danger
        title="¿Archivar categoría?"
        message="No se eliminarán movimientos existentes. La categoría dejará de aparecer en nuevos formularios."
        confirmLabel="Archivar"
        cancelLabel="Volver"
        onCancel={() => setArchiveTarget(null)}
        onConfirm={handleArchive}
      />
    </>
  );
}

function CategoryList({ categories, colors, onArchive, onEdit, spacing, title }) {
  return (
    <Card style={{ marginTop: spacing.md }}>
      <Text style={[styles.listTitle, { color: colors.textPrimary }]}>{title}</Text>
      {categories.map((category) => (
        <View key={category.id} style={[styles.categoryRow, { backgroundColor: colors.surfaceContainerLow }]}>
          <View style={[styles.categoryIcon, { backgroundColor: category.color || colors.primary }]}>
            <Text style={styles.categoryEmoji}>{category.icon || "🏷️"}</Text>
          </View>
          <View style={styles.categoryCopy}>
            <Text style={[styles.categoryName, { color: colors.textPrimary }]}>{category.name}</Text>
            <Text style={[styles.categoryMeta, { color: colors.textSecondary }]}>
              {category.isDefault ? "Base de Mis Soles" : "Personalizada"}
            </Text>
          </View>
          <Pressable onPress={() => onEdit(category)} style={styles.iconButton}>
            <Ionicons name="create-outline" size={19} color={colors.primary} />
          </Pressable>
          {!category.isDefault ? (
            <Pressable onPress={() => onArchive(category)} style={styles.iconButton}>
              <Ionicons name="archive-outline" size={19} color={colors.red} />
            </Pressable>
          ) : null}
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  categoryCopy: {
    flex: 1,
  },
  categoryEmoji: {
    fontSize: 18,
  },
  categoryIcon: {
    alignItems: "center",
    borderRadius: 16,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  categoryMeta: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: "900",
  },
  categoryRow: {
    alignItems: "center",
    borderRadius: 18,
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    padding: 12,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  closeButton: {
    alignItems: "center",
    borderRadius: 21,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  colorDot: {
    borderRadius: 16,
    borderWidth: 2,
    height: 32,
    width: 32,
  },
  error: {
    fontWeight: "700",
  },
  formTitle: {
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 12,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconButton: {
    padding: 6,
  },
  listTitle: {
    fontSize: 17,
    fontWeight: "900",
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "900",
    marginTop: 14,
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  title: {
    fontWeight: "900",
  },
});
